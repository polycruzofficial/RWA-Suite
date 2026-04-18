// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title YieldDistributor
 * @dev Manages yield tokenization: principal/yield token separation,
 *      fixed yield positions, and yield swap mechanics.
 */
contract YieldDistributor is AccessControl, ReentrancyGuard {
    bytes32 public constant YIELD_ADMIN = keccak256("YIELD_ADMIN");

    enum StrategyType { FixedYield, LongYield, YieldSwap, LiquidityProvision }

    struct YieldStrategy {
        string name;
        StrategyType strategyType;
        address underlyingToken;   // RWA token address
        uint256 apyBps;
        uint256 totalStaked;
        uint256 totalYieldPaid;
        uint256 minStake;
        uint256 lockDuration;      // in seconds, 0 for no lock
        bool active;
    }

    struct StakePosition {
        uint256 strategyId;
        address staker;
        uint256 amount;
        uint256 stakedAt;
        uint256 lastClaimAt;
        uint256 totalClaimed;
        bool active;
    }

    YieldStrategy[] public strategies;
    StakePosition[] public positions;
    mapping(address => uint256[]) public userPositions;

    // Yield pool balance (funded by issuer)
    uint256 public yieldPool;

    event StrategyCreated(uint256 indexed strategyId, string name, StrategyType strategyType, uint256 apyBps);
    event StrategyUpdated(uint256 indexed strategyId, uint256 newApyBps, bool active);
    event Staked(uint256 indexed positionId, uint256 indexed strategyId, address staker, uint256 amount);
    event YieldClaimed(uint256 indexed positionId, address staker, uint256 yieldAmount);
    event Unstaked(uint256 indexed positionId, address staker, uint256 amount);
    event YieldPoolFunded(uint256 amount);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(YIELD_ADMIN, msg.sender);
    }

    receive() external payable {
        yieldPool += msg.value;
        emit YieldPoolFunded(msg.value);
    }

    // ── Strategy Management ──

    function createStrategy(
        string calldata name_,
        StrategyType type_,
        address underlyingToken_,
        uint256 apyBps_,
        uint256 minStake_,
        uint256 lockDuration_
    ) external onlyRole(YIELD_ADMIN) {
        strategies.push(YieldStrategy({
            name: name_,
            strategyType: type_,
            underlyingToken: underlyingToken_,
            apyBps: apyBps_,
            totalStaked: 0,
            totalYieldPaid: 0,
            minStake: minStake_,
            lockDuration: lockDuration_,
            active: true
        }));
        emit StrategyCreated(strategies.length - 1, name_, type_, apyBps_);
    }

    function updateStrategy(uint256 strategyId, uint256 newApyBps, bool active_) external onlyRole(YIELD_ADMIN) {
        require(strategyId < strategies.length, "Invalid strategy");
        strategies[strategyId].apyBps = newApyBps;
        strategies[strategyId].active = active_;
        emit StrategyUpdated(strategyId, newApyBps, active_);
    }

    // ── Staking ──

    function stake(uint256 strategyId) external payable nonReentrant {
        require(strategyId < strategies.length, "Invalid strategy");
        YieldStrategy storage s = strategies[strategyId];
        require(s.active, "Strategy inactive");
        require(msg.value >= s.minStake, "Below min stake");

        uint256 posId = positions.length;
        positions.push(StakePosition({
            strategyId: strategyId,
            staker: msg.sender,
            amount: msg.value,
            stakedAt: block.timestamp,
            lastClaimAt: block.timestamp,
            totalClaimed: 0,
            active: true
        }));

        s.totalStaked += msg.value;
        userPositions[msg.sender].push(posId);

        emit Staked(posId, strategyId, msg.sender, msg.value);
    }

    function claimYield(uint256 positionId) external nonReentrant {
        StakePosition storage pos = positions[positionId];
        require(pos.staker == msg.sender, "Not owner");
        require(pos.active, "Position closed");

        uint256 yieldAmount = calculateYield(positionId);
        require(yieldAmount > 0, "No yield");
        require(yieldPool >= yieldAmount, "Insufficient yield pool");

        pos.lastClaimAt = block.timestamp;
        pos.totalClaimed += yieldAmount;
        yieldPool -= yieldAmount;

        strategies[pos.strategyId].totalYieldPaid += yieldAmount;

        (bool sent, ) = msg.sender.call{value: yieldAmount}("");
        require(sent, "Transfer failed");

        emit YieldClaimed(positionId, msg.sender, yieldAmount);
    }

    function unstake(uint256 positionId) external nonReentrant {
        StakePosition storage pos = positions[positionId];
        require(pos.staker == msg.sender, "Not owner");
        require(pos.active, "Position closed");

        YieldStrategy storage s = strategies[pos.strategyId];
        if (s.lockDuration > 0) {
            require(block.timestamp >= pos.stakedAt + s.lockDuration, "Lock active");
        }

        // Claim any pending yield first
        uint256 yieldAmount = calculateYield(positionId);
        uint256 totalPayout = pos.amount + yieldAmount;

        pos.active = false;
        s.totalStaked -= pos.amount;

        if (yieldAmount > 0 && yieldPool >= yieldAmount) {
            yieldPool -= yieldAmount;
            s.totalYieldPaid += yieldAmount;
            pos.totalClaimed += yieldAmount;
        } else {
            totalPayout = pos.amount;
        }

        (bool sent, ) = msg.sender.call{value: totalPayout}("");
        require(sent, "Transfer failed");

        emit Unstaked(positionId, msg.sender, pos.amount);
        if (yieldAmount > 0) {
            emit YieldClaimed(positionId, msg.sender, yieldAmount);
        }
    }

    // ── Yield Calculation ──

    function calculateYield(uint256 positionId) public view returns (uint256) {
        StakePosition memory pos = positions[positionId];
        if (!pos.active) return 0;

        YieldStrategy memory s = strategies[pos.strategyId];
        uint256 elapsed = block.timestamp - pos.lastClaimAt;

        // yield = principal * apyBps / 10000 * elapsed / 365 days
        return (pos.amount * s.apyBps * elapsed) / (10000 * 365 days);
    }

    // ── Views ──

    function getStrategyCount() external view returns (uint256) {
        return strategies.length;
    }

    function getPositionCount() external view returns (uint256) {
        return positions.length;
    }

    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    function getUserPositionDetails(address user) external view returns (StakePosition[] memory) {
        uint256[] memory ids = userPositions[user];
        StakePosition[] memory result = new StakePosition[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = positions[ids[i]];
        }
        return result;
    }

    // ── Admin ──

    function fundYieldPool() external payable onlyRole(YIELD_ADMIN) {
        yieldPool += msg.value;
        emit YieldPoolFunded(msg.value);
    }
}
