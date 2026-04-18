// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RWAToken.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RWATokenFactory
 * @dev Factory contract for deploying new RWA tokens. Maintains a registry of all deployed tokens.
 */
contract RWATokenFactory is AccessControl {
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");

    struct TokenRecord {
        address tokenAddress;
        address issuer;
        string assetType;
        string name;
        string symbol;
        uint256 deployedAt;
        bool active;
    }

    TokenRecord[] public tokens;
    mapping(address => uint256[]) public issuerTokens;
    mapping(address => bool) public isRegisteredToken;

    event TokenDeployed(
        address indexed tokenAddress,
        address indexed issuer,
        string name,
        string symbol,
        string assetType,
        uint256 indexed tokenId
    );
    event TokenDeactivated(uint256 indexed tokenId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DEPLOYER_ROLE, msg.sender);
    }

    function deployToken(
        string calldata name_,
        string calldata symbol_,
        string calldata assetType_,
        string calldata jurisdiction_,
        string calldata ipfsDocHash_,
        uint256 totalValueUSD_,
        uint256 maturityDate_,
        uint256 yieldBps_,
        uint256 initialSupply_
    ) external onlyRole(DEPLOYER_ROLE) returns (address) {
        RWAToken token = new RWAToken(
            name_,
            symbol_,
            assetType_,
            jurisdiction_,
            ipfsDocHash_,
            totalValueUSD_,
            maturityDate_,
            yieldBps_,
            initialSupply_,
            msg.sender
        );

        address tokenAddr = address(token);
        uint256 tokenId = tokens.length;

        tokens.push(TokenRecord({
            tokenAddress: tokenAddr,
            issuer: msg.sender,
            assetType: assetType_,
            name: name_,
            symbol: symbol_,
            deployedAt: block.timestamp,
            active: true
        }));

        issuerTokens[msg.sender].push(tokenId);
        isRegisteredToken[tokenAddr] = true;

        emit TokenDeployed(tokenAddr, msg.sender, name_, symbol_, assetType_, tokenId);
        return tokenAddr;
    }

    function deactivateToken(uint256 tokenId) external {
        require(tokenId < tokens.length, "Invalid token ID");
        require(tokens[tokenId].issuer == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        tokens[tokenId].active = false;
        emit TokenDeactivated(tokenId);
    }

    function getTokenCount() external view returns (uint256) {
        return tokens.length;
    }

    function getIssuerTokens(address issuer) external view returns (uint256[] memory) {
        return issuerTokens[issuer];
    }

    function getTokensByIssuer(address issuer) external view returns (TokenRecord[] memory) {
        uint256[] memory ids = issuerTokens[issuer];
        TokenRecord[] memory result = new TokenRecord[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = tokens[ids[i]];
        }
        return result;
    }

    function getAllActiveTokens() external view returns (TokenRecord[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i].active) count++;
        }
        TokenRecord[] memory result = new TokenRecord[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i].active) {
                result[idx++] = tokens[i];
            }
        }
        return result;
    }
}
