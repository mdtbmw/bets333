// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

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
    event BetPlaced(uint256 indexed eventId, address indexed user, bool outcome, uint256 amount);
    event EventResolved(uint256 indexed eventId, Outcome winningOutcome);
    event WinningsClaimed(uint256 indexed eventId, address indexed user, uint256 amount);
    event EventCanceled(uint256 indexed eventId);

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
        require(bettingStop > block.timestamp, "Betting stop date must be in the future");
        require(resolution > bettingStop, "Resolution must be after betting stop");
        
        events[nextEventId] = EventData(
            nextEventId, q, desc, cat, img, bettingStop, resolution,
            minStake, maxStake, 0, 0, EventStatus.Open, Outcome.None
        );

        emit EventCreated(nextEventId, q, desc, cat, img, bettingStop, resolution, minStake, maxStake);
        nextEventId++;
    }

    function placeBet(uint256 id, bool outcome) external payable nonReentrant {
        EventData storage eventData = events[id];
        require(eventData.status == EventStatus.Open, "Event not open for betting");
        require(block.timestamp < eventData.bettingStopDate, "Betting has closed");
        require(msg.value >= eventData.minStake, "Stake is below minimum");
        require(msg.value <= eventData.maxStake, "Stake is above maximum");

        if (outcome) { // Bet YES
            eventData.yesPool += msg.value;
            userBets[id][msg.sender].yesAmount += msg.value;
        } else { // Bet NO
            eventData.noPool += msg.value;
            userBets[id][msg.sender].noAmount += msg.value;
        }

        emit BetPlaced(id, msg.sender, outcome, msg.value);
    }

    function resolveEvent(uint256 id, bool yesWins) external onlyOwner {
        EventData storage eventData = events[id];
        require(eventData.status != EventStatus.Finished && eventData.status != EventStatus.Canceled, "Event already concluded");
        
        eventData.status = EventStatus.Finished;
        eventData.winningOutcome = yesWins ? Outcome.YES : Outcome.NO;

        emit EventResolved(id, eventData.winningOutcome);
    }

    function claim(uint256 id) external nonReentrant {
        EventData storage eventData = events[id];
        Bet storage bet = userBets[id][msg.sender];
        require(!bet.claimed, "Winnings already claimed");

        uint256 payout = 0;
        if (eventData.status == EventStatus.Finished) {
            bool userWon = (bet.yesAmount > 0 && eventData.winningOutcome == Outcome.YES) || (bet.noAmount > 0 && eventData.winningOutcome == Outcome.NO);
            require(userWon, "Not a winning bet");
            
            uint256 totalPool = eventData.yesPool + eventData.noPool;
            uint256 winningPool = eventData.winningOutcome == Outcome.YES ? eventData.yesPool : eventData.noPool;
            uint256 userStake = eventData.winningOutcome == Outcome.YES ? bet.yesAmount : bet.noAmount;

            uint256 fee = (totalPool * platformFeeBps) / 10000;
            uint256 distributablePool = totalPool - fee;
            
            payout = (userStake * distributablePool) / winningPool;

            if (fee > 0) {
                 (bool success, ) = treasury.call{value: fee}("");
                 require(success, "Fee transfer failed");
            }

        } else if (eventData.status == EventStatus.Canceled) {
            payout = bet.yesAmount + bet.noAmount;
        } else {
            revert("Event not finished or canceled");
        }

        require(payout > 0, "No payout available");
        bet.claimed = true;
        
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Payout transfer failed");

        emit WinningsClaimed(id, msg.sender, payout);
    }
    
    function cancelEvent(uint256 id) external onlyOwner {
        require(events[id].status == EventStatus.Open, "Can only cancel open events");
        events[id].status = EventStatus.Canceled;
        emit EventCanceled(id);
    }

    function setTreasury(address _newTreasury) external onlyOwner {
        treasury = _newTreasury;
    }

    function setPlatformFee(uint256 _newFeeBps) external onlyOwner {
        platformFeeBps = _newFeeBps;
    }

    function getEvent(uint256 id) external view returns (EventData memory) {
        return events[id];
    }
    
    function getUserBet(uint256 eventId, address user) external view returns (Bet memory) {
        return userBets[eventId][user];
    }

    function getMultipleUserBets(uint256[] memory eventIds, address user) external view returns (Bet[] memory) {
        Bet[] memory bets = new Bet[](eventIds.length);
        for (uint i = 0; i < eventIds.length; i++) {
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
}