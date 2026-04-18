// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RWAToken
 * @dev ERC-20 token representing a Real World Asset with compliance controls.
 *      Inspired by ERC-3643 (T-REX) for regulated security tokens.
 */
contract RWAToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant TRANSFER_AGENT_ROLE = keccak256("TRANSFER_AGENT_ROLE");

    struct AssetDetails {
        string assetType;       // "bond", "credit", "commodity", "equity"
        string jurisdiction;    // e.g. "GB", "US"
        string ipfsDocHash;     // IPFS hash for legal documents
        uint256 totalValueUSD;  // Total asset value in USD (scaled by 1e18)
        uint256 maturityDate;   // Unix timestamp, 0 if no maturity
        uint256 yieldBps;       // Annual yield in basis points (e.g. 450 = 4.50%)
        bool isActive;
    }

    struct TransferRestriction {
        bool whitelistOnly;
        uint256 lockupEndTime;
        uint256 maxHolders;
        uint256 minTransferAmount;
    }

    AssetDetails public assetDetails;
    TransferRestriction public transferRestriction;

    mapping(address => bool) public whitelist;
    mapping(address => bool) public frozenAccounts;
    uint256 public holderCount;
    mapping(address => bool) private _isHolder;

    // Corporate actions
    struct Dividend {
        uint256 id;
        uint256 totalAmount;
        uint256 perTokenAmount;
        uint256 snapshotBlock;
        uint256 claimDeadline;
        mapping(address => bool) claimed;
    }
    uint256 public dividendCount;
    mapping(uint256 => Dividend) public dividends;

    // Events
    event AssetTokenized(string assetType, uint256 totalValue, string ipfsHash);
    event AssetDetailsUpdated(string ipfsHash, uint256 totalValue);
    event WhitelistUpdated(address indexed account, bool status);
    event AccountFrozen(address indexed account, bool status);
    event TransferRestrictionUpdated(bool whitelistOnly, uint256 lockupEnd);
    event DividendDeclared(uint256 indexed dividendId, uint256 totalAmount, uint256 perToken);
    event DividendClaimed(uint256 indexed dividendId, address indexed holder, uint256 amount);
    event CorporateAction(string actionType, string details, uint256 timestamp);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory assetType_,
        string memory jurisdiction_,
        string memory ipfsDocHash_,
        uint256 totalValueUSD_,
        uint256 maturityDate_,
        uint256 yieldBps_,
        uint256 initialSupply_,
        address issuer_
    ) ERC20(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, issuer_);
        _grantRole(ISSUER_ROLE, issuer_);
        _grantRole(COMPLIANCE_ROLE, issuer_);
        _grantRole(TRANSFER_AGENT_ROLE, issuer_);

        assetDetails = AssetDetails({
            assetType: assetType_,
            jurisdiction: jurisdiction_,
            ipfsDocHash: ipfsDocHash_,
            totalValueUSD: totalValueUSD_,
            maturityDate: maturityDate_,
            yieldBps: yieldBps_,
            isActive: true
        });

        transferRestriction = TransferRestriction({
            whitelistOnly: true,
            lockupEndTime: 0,
            maxHolders: 0,
            minTransferAmount: 0
        });

        // Whitelist and mint to issuer
        whitelist[issuer_] = true;
        _mint(issuer_, initialSupply_);
        _isHolder[issuer_] = true;
        holderCount = 1;

        emit AssetTokenized(assetType_, totalValueUSD_, ipfsDocHash_);
    }

    // ── Compliance Controls ──

    function setWhitelist(address account, bool status) external onlyRole(COMPLIANCE_ROLE) {
        whitelist[account] = status;
        emit WhitelistUpdated(account, status);
    }

    function batchSetWhitelist(address[] calldata accounts, bool status) external onlyRole(COMPLIANCE_ROLE) {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelist[accounts[i]] = status;
            emit WhitelistUpdated(accounts[i], status);
        }
    }

    function setFrozen(address account, bool status) external onlyRole(COMPLIANCE_ROLE) {
        frozenAccounts[account] = status;
        emit AccountFrozen(account, status);
    }

    function updateTransferRestriction(
        bool whitelistOnly_,
        uint256 lockupEndTime_,
        uint256 maxHolders_,
        uint256 minTransferAmount_
    ) external onlyRole(COMPLIANCE_ROLE) {
        transferRestriction = TransferRestriction({
            whitelistOnly: whitelistOnly_,
            lockupEndTime: lockupEndTime_,
            maxHolders: maxHolders_,
            minTransferAmount: minTransferAmount_
        });
        emit TransferRestrictionUpdated(whitelistOnly_, lockupEndTime_);
    }

    // ── Asset Management ──

    function updateAssetDetails(
        string calldata ipfsDocHash_,
        uint256 totalValueUSD_,
        uint256 yieldBps_
    ) external onlyRole(ISSUER_ROLE) {
        assetDetails.ipfsDocHash = ipfsDocHash_;
        assetDetails.totalValueUSD = totalValueUSD_;
        assetDetails.yieldBps = yieldBps_;
        emit AssetDetailsUpdated(ipfsDocHash_, totalValueUSD_);
    }

    function deactivateAsset() external onlyRole(ISSUER_ROLE) {
        assetDetails.isActive = false;
    }

    // ── Token Operations ──

    function mint(address to, uint256 amount) external onlyRole(ISSUER_ROLE) {
        require(assetDetails.isActive, "Asset deactivated");
        if (transferRestriction.whitelistOnly) {
            require(whitelist[to], "Recipient not whitelisted");
        }
        _mint(to, amount);
        _updateHolderCount(to);
    }

    function forcedTransfer(
        address from,
        address to,
        uint256 amount
    ) external onlyRole(TRANSFER_AGENT_ROLE) {
        _transfer(from, to, amount);
        _updateHolderCount(to);
    }

    // ── Dividends / Corporate Actions ──

    function declareDividend(uint256 claimDeadline) external payable onlyRole(ISSUER_ROLE) {
        require(msg.value > 0, "No dividend amount");
        require(totalSupply() > 0, "No tokens outstanding");

        uint256 id = dividendCount++;
        Dividend storage d = dividends[id];
        d.id = id;
        d.totalAmount = msg.value;
        d.perTokenAmount = (msg.value * 1e18) / totalSupply();
        d.snapshotBlock = block.number;
        d.claimDeadline = claimDeadline;

        emit DividendDeclared(id, msg.value, d.perTokenAmount);
    }

    function claimDividend(uint256 dividendId) external {
        Dividend storage d = dividends[dividendId];
        require(!d.claimed[msg.sender], "Already claimed");
        require(block.timestamp <= d.claimDeadline, "Claim period ended");

        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "No tokens held");

        d.claimed[msg.sender] = true;
        uint256 payout = (balance * d.perTokenAmount) / 1e18;

        (bool sent, ) = msg.sender.call{value: payout}("");
        require(sent, "Transfer failed");

        emit DividendClaimed(dividendId, msg.sender, payout);
    }

    function emitCorporateAction(string calldata actionType, string calldata details) external onlyRole(ISSUER_ROLE) {
        emit CorporateAction(actionType, details, block.timestamp);
    }

    // ── Pause ──

    function pause() external onlyRole(ISSUER_ROLE) { _pause(); }
    function unpause() external onlyRole(ISSUER_ROLE) { _unpause(); }

    // ── Internal Overrides ──

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        // Skip checks for minting (from == address(0))
        if (from != address(0)) {
            require(!frozenAccounts[from], "Sender frozen");
            require(!frozenAccounts[to], "Recipient frozen");

            if (transferRestriction.whitelistOnly && to != address(0)) {
                require(whitelist[from] && whitelist[to], "Not whitelisted");
            }

            if (transferRestriction.lockupEndTime > 0) {
                require(block.timestamp >= transferRestriction.lockupEndTime, "Lockup active");
            }

            if (transferRestriction.minTransferAmount > 0) {
                require(value >= transferRestriction.minTransferAmount, "Below min transfer");
            }
        }

        super._update(from, to, value);

        if (to != address(0)) {
            _updateHolderCount(to);
        }
        if (from != address(0) && balanceOf(from) == 0 && _isHolder[from]) {
            _isHolder[from] = false;
            holderCount--;
        }
    }

    function _updateHolderCount(address account) private {
        if (!_isHolder[account] && balanceOf(account) > 0) {
            if (transferRestriction.maxHolders > 0) {
                require(holderCount < transferRestriction.maxHolders, "Max holders reached");
            }
            _isHolder[account] = true;
            holderCount++;
        }
    }
}
