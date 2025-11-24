// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract UserProfileRegistry is Ownable, ReentrancyGuard {
    struct Profile {
        string username;
        string bio;
        string twitterHandle;
        string websiteUrl;
    }

    mapping(address => Profile) public profiles;

    event ProfileUpdated(address indexed user, string username, string bio);

    constructor(address _initialOwner) Ownable(_initialOwner) {}

    function setProfile(
        string memory _username,
        string memory _bio,
        string memory _twitterHandle,
        string memory _websiteUrl
    ) external nonReentrant {
        profiles[msg.sender] = Profile(_username, _bio, _twitterHandle, _websiteUrl);
        emit ProfileUpdated(msg.sender, _username, _bio);
    }

    function getProfile(address _user) external view returns (Profile memory) {
        return profiles[_user];
    }
}
