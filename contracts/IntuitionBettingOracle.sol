// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract IntuitionBettingOracle is Ownable, ReentrancyGuard {

    enum EventStatus { Open, Closed, Finished, Canceled }
    enum Outcome { None, YES, NO }

    struct EventData {
        uint256 id;
        string question;
        string description;
        string category;
        string imageUrl;
        uint256 bettingStopDate;
        uint256 resolutionDate;
        uint256 minStake;
        uint256 maxStake;
        uint256 yesPool;
        uint256 noPool;
        EventStatus status;
        Outcome winningOutcome;
    }

    struct Bet {
        uint256 yesAmount;
        uint256 noAmount;
        bool claimed;
    }

    mapping(uint256 => EventData) public events;
    mapping(uint256 => mapping(address => Bet)) public userBets;
    uint256 public nextEventId;

    address public treasury;
    uint256 public platformFeeBps; // Fee in basis points (e.g., 300 for 3%)

    event EventCreated(
        uint256 indexed id,
        string question,
        string description,
        string category,
        string imageUrl,
        uint256 bettingStopDate,
        uint256 resolutionDate,
        uint256 minStake,
        uint256 maxStake
    );

    event BetPlaced(
        uint256 indexed eventId,
        address indexed user,
        bool outcome, // true for YES, false for NO
        uint256 amount
    );
    
    event EventResolved(uint256 indexed eventId, Outcome winningOutcome);
    event EventCanceled(uint256 indexed eventId);
    event WinningsClaimed(uint256 indexed eventId, address indexed user, uint256 amount);


    constructor(address _initialOwner, address _treasury, uint256 _platformFeeBps) Ownable(_initialOwner) {
        treasury = _treasury;
        platformFeeBps = _platformFeeBps;
    }

    function createEvent(
        string memory q,
        string memory desc,
        string memory cat,
        string memory img,
        uint256 bettingStop,
        uint256 resolution,
        uint256 minStake,
        uint256 maxStake
    ) external onlyOwner {
        require(bettingStop < resolution, "Betting must stop before resolution");
        require(minStake < maxStake, "Min stake must be less than max stake");

        events[nextEventId] = EventData({
            id: nextEventId,
            question: q,
            description: desc,
            category: cat,
            imageUrl: img,
            bettingStopDate: bettingStop,
            resolutionDate: resolution,
            minStake: minStake,
            maxStake: maxStake,
            yesPool: 0,
            noPool: 0,
            status: EventStatus.Open,
            winningOutcome: Outcome.None
        });

        emit EventCreated(nextEventId, q, desc, cat, img, bettingStop, resolution, minStake, maxStake);
        nextEventId++;
    }

    function placeBet(uint256 id, bool outcome) external payable nonReentrant {
        EventData storage currentEvent = events[id];
        require(currentEvent.status == EventStatus.Open, "Event not open for betting");
        require(block.timestamp < currentEvent.bettingStopDate, "Betting has closed");
        require(msg.value >= currentEvent.minStake, "Stake is below minimum");
        require(msg.value <= currentEvent.maxStake, "Stake is above maximum");

        Bet storage bet = userBets[id][msg.sender];
        
        if (outcome) { // Bet on YES
            bet.yesAmount += msg.value;
            currentEvent.yesPool += msg.value;
        } else { // Bet on NO
            bet.noAmount += msg.value;
            currentEvent.noPool += msg.value;
        }

        emit BetPlaced(id, msg.sender, outcome, msg.value);
    }
    
    function resolveEvent(uint256 id, bool yesWins) external onlyOwner {
        EventData storage currentEvent = events[id];
        require(currentEvent.status != EventStatus.Finished && currentEvent.status != EventStatus.Canceled, "Event already concluded");
        
        currentEvent.status = EventStatus.Finished;
        currentEvent.winningOutcome = yesWins ? Outcome.YES : Outcome.NO;

        emit EventResolved(id, currentEvent.winningOutcome);
    }

    function cancelEvent(uint256 id) external onlyOwner {
        EventData storage currentEvent = events[id];
        require(currentEvent.status == EventStatus.Open, "Can only cancel open events");
        currentEvent.status = EventStatus.Canceled;
        emit EventCanceled(id);
    }

    function claim(uint256 id) external nonReentrant {
        EventData storage currentEvent = events[id];
        Bet storage bet = userBets[id][msg.sender];
        require(!bet.claimed, "Winnings already claimed");

        uint256 payout = 0;
        if (currentEvent.status == EventStatus.Finished) {
            uint256 totalPool = currentEvent.yesPool + currentEvent.noPool;
            if (totalPool == 0) {
                 bet.claimed = true; // Nothing to claim
                 return;
            }

            if (currentEvent.winningOutcome == Outcome.YES && bet.yesAmount > 0) {
                uint256 fee = (totalPool * platformFeeBps) / 10000;
                payout = (bet.yesAmount * (totalPool - fee)) / currentEvent.yesPool;
            } else if (currentEvent.winningOutcome == Outcome.NO && bet.noAmount > 0) {
                uint256 fee = (totalPool * platformFeeBps) / 10000;
                payout = (bet.noAmount * (totalPool - fee)) / currentEvent.noPool;
            }
        } else if (currentEvent.status == EventStatus.Canceled) {
            payout = bet.yesAmount + bet.noAmount;
        } else {
            revert("Event not resolved or canceled");
        }

        if (payout > 0) {
            bet.claimed = true;
            (bool success, ) = msg.sender.call{value: payout}("");
            require(success, "Transfer failed");
            emit WinningsClaimed(id, msg.sender, payout);
        }
    }
    
    function getEvent(uint256 id) external view returns (EventData memory) {
        return events[id];
    }
    
    function getUserBet(uint256 eventId, address user) external view returns (Bet memory) {
        return userBets[eventId][user];
    }
    
    function getMultipleUserBets(uint256[] memory eventIds, address user) external view returns (Bet[] memory) {
        Bet[] memory bets = new Bet[](eventIds.length);
        for(uint i=0; i < eventIds.length; i++){
            bets[i] = userBets[eventIds[i]][user];
        }
        return bets;
    }

    function getAllEventIds() external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](nextEventId);
        for (uint i = 0; i < nextEventId; i++) {
            ids[i] = i;
        }
        return ids;
    }

    function setTreasury(address _newTreasury) external onlyOwner {
        treasury = _newTreasury;
    }

    function setPlatformFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 1000, "Fee cannot exceed 10%");
        platformFeeBps = _newFeeBps;
    }
}
