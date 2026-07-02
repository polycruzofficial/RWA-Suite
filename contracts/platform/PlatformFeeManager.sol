// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title PlatformFeeManager
 * @dev Collects platform-level fees in the chain's native currency:
 *      - a flat fee charged to issuers when deploying a new RWA token
 *      - a basis-point fee charged to investors on marketplace buy orders,
 *        split atomically between the platform and the asset's treasury.
 *      Deployed once per chain, independent of the RWATokenFactory/TreasuryVault
 *      so it can be wired in (or left unset) without touching those contracts.
 */
contract PlatformFeeManager is AccessControl, ReentrancyGuard {
    using Address for address payable;

    bytes32 public constant FEE_ADMIN_ROLE = keccak256("FEE_ADMIN_ROLE");

    uint256 public constant MAX_BUY_FEE_BPS = 1000; // hard cap: 10%

    uint256 public deploymentFeeWei;
    uint256 public buyFeeBps;
    address payable public feeRecipient;

    event DeploymentFeeCollected(address indexed issuer, string symbol, uint256 amount);
    event BuyFeeCollected(
        address indexed buyer,
        address indexed asset,
        address indexed settledTo,
        uint256 grossAmount,
        uint256 feeAmount
    );
    event DeploymentFeeUpdated(uint256 newFeeWei);
    event BuyFeeUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address indexed newRecipient);

    constructor(address payable feeRecipient_, uint256 deploymentFeeWei_, uint256 buyFeeBps_) {
        require(feeRecipient_ != address(0), "Fee recipient required");
        require(buyFeeBps_ <= MAX_BUY_FEE_BPS, "Buy fee too high");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FEE_ADMIN_ROLE, msg.sender);

        feeRecipient = feeRecipient_;
        deploymentFeeWei = deploymentFeeWei_;
        buyFeeBps = buyFeeBps_;
    }

    /// @notice Issuer-paid flat fee for deploying a new RWA token on this chain.
    function payDeploymentFee(string calldata symbol) external payable nonReentrant {
        require(msg.value == deploymentFeeWei, "Incorrect deployment fee");
        feeRecipient.sendValue(msg.value);
        emit DeploymentFeeCollected(msg.sender, symbol, msg.value);
    }

    /// @notice Investor-paid buy order. Splits msg.value between the platform
    ///         fee and the asset's settlement address (e.g. its TreasuryVault)
    ///         in a single atomic transaction.
    function collectBuyFee(address asset, address payable settleTo) external payable nonReentrant returns (uint256 netAmount) {
        require(msg.value > 0, "No payment");
        require(settleTo != address(0), "Invalid settlement address");

        uint256 fee = (msg.value * buyFeeBps) / 10_000;
        netAmount = msg.value - fee;

        if (fee > 0) {
            feeRecipient.sendValue(fee);
        }
        settleTo.sendValue(netAmount);

        emit BuyFeeCollected(msg.sender, asset, settleTo, msg.value, fee);
    }

    function setDeploymentFee(uint256 newFeeWei) external onlyRole(FEE_ADMIN_ROLE) {
        deploymentFeeWei = newFeeWei;
        emit DeploymentFeeUpdated(newFeeWei);
    }

    function setBuyFeeBps(uint256 newFeeBps) external onlyRole(FEE_ADMIN_ROLE) {
        require(newFeeBps <= MAX_BUY_FEE_BPS, "Buy fee too high");
        buyFeeBps = newFeeBps;
        emit BuyFeeUpdated(newFeeBps);
    }

    function setFeeRecipient(address payable newRecipient) external onlyRole(FEE_ADMIN_ROLE) {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }
}
