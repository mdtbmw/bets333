// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract IntuitionBettingOracle is Ownable, ReentrancyGuard {

    enum EventStatus { Open, Closed, Finished, Canceled }
    enum Outcome { None, YES, NO }

    struct Bet {
        uint256 yesAmount;
        uint256 noAmount;
        bool claimed;
    }

    struct EventData {
        uint256 id;
        string question;
        string description;
        string category;
        string imageUrl;
        uint256 startDate;
        uint256 bettingStopDate;
        uint256 resolutionDate;
        uint256 minStake;
        uint256 maxStake;
        uint256 yesPool;
        uint256 noPool;
        EventStatus status;
        Outcome winningOutcome;
    }

    uint256 public nextEventId;
    mapping(uint256 => EventData) public events;
    mapping(uint256 => mapping(address => Bet)) public userBets;
    address public treasury;
    uint256 public platformFeeBps; // Basis points, e.g., 300 for 3%

    event EventCreated(
        uint256 indexed id,
        string question,
        string description,
        string category,
        string imageUrl,
        uint256 startDate,
        uint256 bettingStopDate,
        uint256 resolutionDate,
        uint256 minStake,
        uint256 maxStake
    );
    event BetPlaced(uint256 indexed eventId, address indexed user, bool outcome, uint256 amount);
    event EventResolved(uint256 indexed eventId, Outcome winningOutcome);
    event EventCanceled(uint256 indexed eventId);
    event WinningsClaimed(uint256 indexed eventId, address indexed user, uint256 amount);

    constructor(address _initialOwner, address _treasury, uint256 _platformFeeBps) Ownable(_initialOwner) {
        treasury = _treasury;
        platformFeeBps = _platformFeeBps;
    }

    function setTreasury(address _newTreasury) public onlyOwner {
        treasury = _newTreasury;
    }

    function setPlatformFee(uint256 _newFeeBps) public onlyOwner {
        require(_newFeeBps <= 1000, "Fee cannot exceed 10%"); // 10% cap
        platformFeeBps = _newFeeBps;
    }

    function createEvent(
        string memory q,
        string memory desc,
        string memory cat,
        string memory img,
        uint256 start,
        uint256 bettingStop,
        uint256 resolution,
        uint256 minStake,
        uint256 maxStake
    ) public onlyOwner {
        require(bettingStop > block.timestamp, "Betting stop must be in the future");
        require(resolution > bettingStop, "Resolution must be after betting stop");
        require(minStake > 0, "Min stake must be > 0");
        require(maxStake > minStake, "Max stake must be > min stake");

        uint256 id = nextEventId;
        events[id] = EventData({
            id: id,
            question: q,
            description: desc,
            category: cat,
            imageUrl: img,
            startDate: start,
            bettingStopDate: bettingStop,
            resolutionDate: resolution,
            minStake: minStake,
            maxStake: maxStake,
            yesPool: 0,
            noPool: 0,
            status: EventStatus.Open,
            winningOutcome: Outcome.None
        });
        nextEventId++;
        emit EventCreated(id, q, desc, cat, img, start, bettingStop, resolution, minStake, maxStake);
    }

    function placeBet(uint256 id, bool outcome) public payable nonReentrant {
        EventData storage eventData = events[id];
        require(eventData.status == EventStatus.Open, "Event not open for betting");
        require(block.timestamp < eventData.bettingStopDate, "Betting has closed");
        require(msg.value >= eventData.minStake, "Stake is below minimum");
        require(msg.value <= eventData.maxStake, "Stake is above maximum");

        Bet storage bet = userBets[id][msg.sender];
        
        // CRITICAL FIX: Ensure user cannot bet on both outcomes
        if (outcome) { // If betting YES
            require(bet.noAmount == 0, "Cannot bet on both outcomes");
            bet.yesAmount += msg.value;
            eventData.yesPool += msg.value;
        } else { // If betting NO
            require(bet.yesAmount == 0, "Cannot bet on both outcomes");
            bet.noAmount += msg.value;
            eventData.noPool += msg.value;
        }

        emit BetPlaced(id, msg.sender, outcome, msg.value);
    }

    function resolveEvent(uint256 id, bool yesWins) public onlyOwner {
        EventData storage eventData = events[id];
        require(eventData.status == EventStatus.Open || eventData.status == EventStatus.Closed, "Event already resolved or canceled");
        eventData.status = EventStatus.Finished;
        eventData.winningOutcome = yesWins ? Outcome.YES : Outcome.NO;
        emit EventResolved(id, eventData.winningOutcome);
    }

    function cancelEvent(uint256 id) public onlyOwner {
        EventData storage eventData = events[id];
        require(eventData.status == EventStatus.Open, "Can only cancel open events");
        eventData.status = EventStatus.Canceled;
        emit EventCanceled(id);
    }

    function claim(uint256 id) public nonReentrant {
        EventData storage eventData = events[id];
        Bet storage bet = userBets[id][msg.sender];
        require(!bet.claimed, "Winnings already claimed");

        uint256 payout = 0;
        if (eventData.status == EventStatus.Canceled) {
            payout = bet.yesAmount + bet.noAmount;
        } else if (eventData.status == EventStatus.Finished) {
            bool userWon = (bet.yesAmount > 0 && eventData.winningOutcome == Outcome.YES) || (bet.noAmount > 0 && eventData.winningOutcome == Outcome.NO);
            require(userWon, "Not a winning bet");
            
            uint256 totalPool = eventData.yesPool + eventData.noPool;
            uint256 fee = (totalPool * platformFeeBps) / 10000;
            uint256 distributablePool = totalPool - fee;
            
            if (eventData.winningOutcome == Outcome.YES) {
                payout = (bet.yesAmount * distributablePool) / eventData.yesPool;
            } else {
                payout = (bet.noAmount * distributablePool) / eventData.noPool;
            }
        } else {
            revert("Event is not resolved or canceled");
        }

        require(payout > 0, "No payout available");
        bet.claimed = true;
        
        emit WinningsClaimed(id, msg.sender, payout);
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Transfer failed");
    }

    function getEvent(uint256 id) public view returns (EventData memory) {
        return events[id];
    }
    
    function getUserBet(uint256 eventId, address user) public view returns (Bet memory) {
        return userBets[eventId][user];
    }
    
    function getMultipleUserBets(uint256[] memory eventIds, address user) public view returns (Bet[] memory) {
        Bet[] memory bets = new Bet[](eventIds.length);
        for (uint i = 0; i < eventIds.length; i++) {
            bets[i] = userBets[eventIds[i]][user];
        }
        return bets;
    }

    function getAllEventIds() public view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](nextEventId);
        for (uint i = 0; i < nextEventId; i++) {
            ids[i] = i;
        }
        return ids;
    }
}
