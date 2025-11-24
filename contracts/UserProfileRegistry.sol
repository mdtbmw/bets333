// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

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

    event ProfileUpdated(
        address indexed user,
        string username,
        string bio
    );

    constructor(address _initialOwner) Ownable(_initialOwner) {}

    function setProfile(
        string memory _username,
        string memory _bio,
        string memory _twitterHandle,
        string memory _websiteUrl
    ) external nonReentrant {
        require(bytes(_username).length > 2, "Username too short");
        require(bytes(_username).length < 32, "Username too long");
        
        profiles[msg.sender] = Profile({
            username: _username,
            bio: _bio,
            twitterHandle: _twitterHandle,
            websiteUrl: _websiteUrl
        });

        emit ProfileUpdated(msg.sender, _username, _bio);
    }

    function getProfile(address _user) external view returns (Profile memory) {
        return profiles[_user];
    }
}
