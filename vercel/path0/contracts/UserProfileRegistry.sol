// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title UserProfileRegistry
 * @dev A contract to manage user profiles on the Intuition platform.
 * It allows users to associate a username, bio, and social links with their
 * Ethereum address. This registry serves as the on-chain source of truth for user identity.
 */
contract UserProfileRegistry is Ownable, ReentrancyGuard {
    
    // Struct to hold user profile information
    struct Profile {
        string username;
        string bio;
        string twitterHandle;
        string websiteUrl;
    }

    // Mapping from user address to their profile
    mapping(address => Profile) public profiles;

    // Event emitted when a profile is created or updated
    event ProfileUpdated(address indexed user, string username, string bio);

    /**
     * @dev Contract constructor.
     * @param _initialOwner The address that will have ownership of the contract.
     */
    constructor(address _initialOwner) Ownable(_initialOwner) {}

    /**
     * @notice Creates or updates the profile for the message sender.
     * @dev Only the profile owner can call this function for their own address.
     *      Input strings are capped to prevent excessive gas costs.
     * @param _username The desired username (max 32 bytes).
     * @param _bio A short biography (max 256 bytes).
     * @param _twitterHandle The user's Twitter handle, without the '@' (max 15 bytes).
     * @param _websiteUrl The user's personal or professional website URL (max 128 bytes).
     */
    function setProfile(
        string calldata _username,
        string calldata _bio,
        string calldata _twitterHandle,
        string calldata _websiteUrl
    ) external nonReentrant {
        // --- Input Validation ---
        require(bytes(_username).length <= 32, "Username too long");
        require(bytes(_bio).length <= 256, "Bio too long");
        require(bytes(_twitterHandle).length <= 15, "Twitter handle too long");
        require(bytes(_websiteUrl).length <= 128, "Website URL too long");

        // --- State Modification ---
        Profile storage userProfile = profiles[msg.sender];
        userProfile.username = _username;
        userProfile.bio = _bio;
        userProfile.twitterHandle = _twitterHandle;
        userProfile.websiteUrl = _websiteUrl;

        // --- Effects ---
        emit ProfileUpdated(msg.sender, _username, _bio);
    }

    /**
     * @notice Retrieves the profile for a given address.
     * @param _user The address of the user to look up.
     * @return A memory struct containing the user's profile data.
     */
    function getProfile(address _user) external view returns (Profile memory) {
        return profiles[_user];
    }
}
