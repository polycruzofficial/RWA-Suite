// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TreasuryVault
 * @dev Multi-asset treasury management for RWA platform.
 *      Manages reserves, yield allocation, and capital rebalancing.
 */
contract TreasuryVault is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");
    bytes32 public constant YIELD_MANAGER_ROLE = keccak256("YIELD_MANAGER_ROLE");

    struct Reserve {
        address token;
        string name;
        uint256 targetAllocationBps; // target % in bps (e.g. 4500 = 45%)
        bool active;
    }

    struct YieldProduct {
        string name;
        uint256 apyBps;         // APY in basis points
        string riskLevel;       // "minimal", "low", "medium", "high"
        string provider;
        uint256 totalDeposited;
        uint256 maturityDate;   // 0 for instant access
        bool active;
    }

    struct RebalanceAction {
        address fromToken;
        address toToken;
        uint256 amount;
        address executor;
        uint256 timestamp;
    }

    Reserve[] public reserves;
    YieldProduct[] public yieldProducts;
    RebalanceAction[] public rebalanceHistory;

    uint256 public totalTreasuryValueUSD; // manually updated oracle value
    uint256 public lastNAVUpdate;

    // Multisig-like approval for large transactions
    uint256 public approvalThreshold; // value above which multisig needed
    mapping(bytes32 => uint256) public pendingApprovals;
    mapping(bytes32 => mapping(address => bool)) public hasApproved;
    uint256 public requiredApprovals;

    event ReserveAdded(uint256 indexed reserveId, address token, string name, uint256 targetBps);
    event ReserveUpdated(uint256 indexed reserveId, uint256 newTargetBps);
    event YieldProductAdded(uint256 indexed productId, string name, uint256 apyBps);
    event YieldProductUpdated(uint256 indexed productId, uint256 newApyBps, bool active);
    event DepositToYield(uint256 indexed productId, uint256 amount, address depositor);
    event Rebalanced(address fromToken, address toToken, uint256 amount);
    event NAVUpdated(uint256 newValue, uint256 timestamp);
    event NativeDeposit(address indexed from, uint256 amount);
    event NativeWithdrawal(address indexed to, uint256 amount);
    event ApprovalSubmitted(bytes32 indexed actionHash, address approver);

    constructor(uint256 approvalThreshold_, uint256 requiredApprovals_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TREASURER_ROLE, msg.sender);
        _grantRole(YIELD_MANAGER_ROLE, msg.sender);
        approvalThreshold = approvalThreshold_;
        requiredApprovals = requiredApprovals_;
    }

    receive() external payable {
        emit NativeDeposit(msg.sender, msg.value);
    }

    // ── Reserve Management ──

    function addReserve(
        address token_,
        string calldata name_,
        uint256 targetBps_
    ) external onlyRole(TREASURER_ROLE) {
        reserves.push(Reserve({
            token: token_,
            name: name_,
            targetAllocationBps: targetBps_,
            active: true
        }));
        emit ReserveAdded(reserves.length - 1, token_, name_, targetBps_);
    }

    function updateReserveTarget(uint256 reserveId, uint256 newTargetBps) external onlyRole(TREASURER_ROLE) {
        require(reserveId < reserves.length, "Invalid reserve");
        reserves[reserveId].targetAllocationBps = newTargetBps;
        emit ReserveUpdated(reserveId, newTargetBps);
    }

    function getReserveCount() external view returns (uint256) {
        return reserves.length;
    }

    // ── Yield Products ──

    function addYieldProduct(
        string calldata name_,
        uint256 apyBps_,
        string calldata riskLevel_,
        string calldata provider_,
        uint256 maturityDate_
    ) external onlyRole(YIELD_MANAGER_ROLE) {
        yieldProducts.push(YieldProduct({
            name: name_,
            apyBps: apyBps_,
            riskLevel: riskLevel_,
            provider: provider_,
            totalDeposited: 0,
            maturityDate: maturityDate_,
            active: true
        }));
        emit YieldProductAdded(yieldProducts.length - 1, name_, apyBps_);
    }

    function updateYieldProduct(
        uint256 productId,
        uint256 newApyBps,
        bool active_
    ) external onlyRole(YIELD_MANAGER_ROLE) {
        require(productId < yieldProducts.length, "Invalid product");
        yieldProducts[productId].apyBps = newApyBps;
        yieldProducts[productId].active = active_;
        emit YieldProductUpdated(productId, newApyBps, active_);
    }

    function depositToYieldProduct(uint256 productId) external payable nonReentrant {
        require(productId < yieldProducts.length, "Invalid product");
        require(yieldProducts[productId].active, "Product inactive");
        require(msg.value > 0, "No deposit");

        yieldProducts[productId].totalDeposited += msg.value;
        emit DepositToYield(productId, msg.value, msg.sender);
    }

    function getYieldProductCount() external view returns (uint256) {
        return yieldProducts.length;
    }

    // ── Capital Rebalancing ──

    function rebalance(
        address fromToken,
        address toToken,
        uint256 amount
    ) external onlyRole(TREASURER_ROLE) nonReentrant {
        if (amount >= approvalThreshold) {
            bytes32 actionHash = keccak256(abi.encodePacked(fromToken, toToken, amount, block.timestamp));
            if (!hasApproved[actionHash][msg.sender]) {
                hasApproved[actionHash][msg.sender] = true;
                pendingApprovals[actionHash]++;
                emit ApprovalSubmitted(actionHash, msg.sender);
            }
            require(pendingApprovals[actionHash] >= requiredApprovals, "Needs more approvals");
        }

        if (fromToken == address(0)) {
            // Native ETH transfer
            require(address(this).balance >= amount, "Insufficient native balance");
        } else {
            IERC20(fromToken).safeTransfer(address(this), amount);
        }

        rebalanceHistory.push(RebalanceAction({
            fromToken: fromToken,
            toToken: toToken,
            amount: amount,
            executor: msg.sender,
            timestamp: block.timestamp
        }));

        emit Rebalanced(fromToken, toToken, amount);
    }

    // ── NAV ──

    function updateNAV(uint256 newValueUSD) external onlyRole(TREASURER_ROLE) {
        totalTreasuryValueUSD = newValueUSD;
        lastNAVUpdate = block.timestamp;
        emit NAVUpdated(newValueUSD, block.timestamp);
    }

    // ── Withdrawals ──

    function withdrawNative(address payable to, uint256 amount) external onlyRole(TREASURER_ROLE) nonReentrant {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Transfer failed");
        emit NativeWithdrawal(to, amount);
    }

    function withdrawToken(address token, address to, uint256 amount) external onlyRole(TREASURER_ROLE) nonReentrant {
        IERC20(token).safeTransfer(to, amount);
    }

    // ── Views ──

    function getNativeBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getRebalanceHistory(uint256 offset, uint256 limit) external view returns (RebalanceAction[] memory) {
        uint256 end = offset + limit;
        if (end > rebalanceHistory.length) end = rebalanceHistory.length;
        RebalanceAction[] memory result = new RebalanceAction[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = rebalanceHistory[i];
        }
        return result;
    }
}
