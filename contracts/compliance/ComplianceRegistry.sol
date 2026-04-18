// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ComplianceRegistry
 * @dev On-chain KYC/KYB identity vault and compliance registry for RWA participants.
 */
contract ComplianceRegistry is AccessControl {
    bytes32 public constant COMPLIANCE_OFFICER = keccak256("COMPLIANCE_OFFICER");

    enum KYCStatus { None, Pending, Approved, Rejected, Expired }
    enum InvestorType { Retail, Professional, Institutional }

    struct Identity {
        KYCStatus kycStatus;
        InvestorType investorType;
        string jurisdiction;
        string kycDocHash;        // IPFS hash for KYC documents
        uint256 verifiedAt;
        uint256 expiresAt;
        bool sanctioned;
        bool pep;                 // Politically Exposed Person
        uint256 riskScore;        // 0-100
    }

    struct ComplianceRule {
        string ruleId;
        string description;
        bool active;
        string jurisdiction;
        uint256 createdAt;
    }

    mapping(address => Identity) public identities;
    mapping(address => mapping(address => bool)) public tokenApprovals; // investor => token => approved

    ComplianceRule[] public rules;
    mapping(string => uint256) public ruleIndex;

    // Sanctions list
    mapping(address => bool) public sanctionsList;

    // Audit log
    struct AuditEntry {
        address subject;
        string action;
        address performer;
        uint256 timestamp;
        string details;
    }
    AuditEntry[] public auditLog;

    event IdentityUpdated(address indexed account, KYCStatus status, InvestorType investorType);
    event ComplianceRuleAdded(string ruleId, string description, string jurisdiction);
    event ComplianceRuleToggled(string ruleId, bool active);
    event SanctionUpdated(address indexed account, bool sanctioned);
    event TokenApprovalSet(address indexed investor, address indexed token, bool approved);
    event AuditLogged(uint256 indexed entryId, address indexed subject, string action);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER, msg.sender);
    }

    // ── Identity Management ──

    function setIdentity(
        address account,
        KYCStatus status,
        InvestorType investorType_,
        string calldata jurisdiction_,
        string calldata kycDocHash_,
        uint256 expiresAt_,
        bool pep_,
        uint256 riskScore_
    ) external onlyRole(COMPLIANCE_OFFICER) {
        identities[account] = Identity({
            kycStatus: status,
            investorType: investorType_,
            jurisdiction: jurisdiction_,
            kycDocHash: kycDocHash_,
            verifiedAt: block.timestamp,
            expiresAt: expiresAt_,
            sanctioned: sanctionsList[account],
            pep: pep_,
            riskScore: riskScore_
        });

        _logAudit(account, "IDENTITY_UPDATED", "KYC status changed");
        emit IdentityUpdated(account, status, investorType_);
    }

    function isCompliant(address account) external view returns (bool) {
        Identity memory id = identities[account];
        return id.kycStatus == KYCStatus.Approved
            && !id.sanctioned
            && (id.expiresAt == 0 || id.expiresAt > block.timestamp);
    }

    function isApprovedForToken(address investor, address token) external view returns (bool) {
        Identity memory id = identities[investor];
        if (id.kycStatus != KYCStatus.Approved) return false;
        if (id.sanctioned) return false;
        if (id.expiresAt > 0 && id.expiresAt <= block.timestamp) return false;
        return tokenApprovals[investor][token];
    }

    // ── Sanctions ──

    function setSanction(address account, bool status) external onlyRole(COMPLIANCE_OFFICER) {
        sanctionsList[account] = status;
        identities[account].sanctioned = status;
        _logAudit(account, status ? "SANCTIONED" : "UNSANCTIONED", "Sanction status changed");
        emit SanctionUpdated(account, status);
    }

    function batchSetSanctions(address[] calldata accounts, bool status) external onlyRole(COMPLIANCE_OFFICER) {
        for (uint256 i = 0; i < accounts.length; i++) {
            sanctionsList[accounts[i]] = status;
            identities[accounts[i]].sanctioned = status;
            emit SanctionUpdated(accounts[i], status);
        }
    }

    // ── Token Approvals ──

    function setTokenApproval(address investor, address token, bool approved) external onlyRole(COMPLIANCE_OFFICER) {
        tokenApprovals[investor][token] = approved;
        _logAudit(investor, approved ? "TOKEN_APPROVED" : "TOKEN_REVOKED", "Token access changed");
        emit TokenApprovalSet(investor, token, approved);
    }

    // ── Compliance Rules ──

    function addRule(
        string calldata ruleId_,
        string calldata description_,
        string calldata jurisdiction_
    ) external onlyRole(COMPLIANCE_OFFICER) {
        ruleIndex[ruleId_] = rules.length;
        rules.push(ComplianceRule({
            ruleId: ruleId_,
            description: description_,
            active: true,
            jurisdiction: jurisdiction_,
            createdAt: block.timestamp
        }));
        emit ComplianceRuleAdded(ruleId_, description_, jurisdiction_);
    }

    function toggleRule(string calldata ruleId_) external onlyRole(COMPLIANCE_OFFICER) {
        uint256 idx = ruleIndex[ruleId_];
        rules[idx].active = !rules[idx].active;
        emit ComplianceRuleToggled(ruleId_, rules[idx].active);
    }

    function getRuleCount() external view returns (uint256) {
        return rules.length;
    }

    // ── Audit ──

    function _logAudit(address subject, string memory action, string memory details) internal {
        uint256 entryId = auditLog.length;
        auditLog.push(AuditEntry({
            subject: subject,
            action: action,
            performer: msg.sender,
            timestamp: block.timestamp,
            details: details
        }));
        emit AuditLogged(entryId, subject, action);
    }

    function getAuditLogLength() external view returns (uint256) {
        return auditLog.length;
    }

    function getAuditEntries(uint256 offset, uint256 limit) external view returns (AuditEntry[] memory) {
        uint256 end = offset + limit;
        if (end > auditLog.length) end = auditLog.length;
        AuditEntry[] memory result = new AuditEntry[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = auditLog[i];
        }
        return result;
    }
}
