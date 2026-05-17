// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ReviewProof
 * @author Kinmel
 * @notice Stores immutable proof-of-review records on-chain.
 *
 * ── Design Goals ──
 * 1. Prove a review existed at a specific point in time (timestamp).
 * 2. Prove the content has not been tampered with (contentHash).
 * 3. Link the proof to the IPFS document (ipfsCidHash).
 * 4. Prevent duplicate anchoring for the same review.
 * 5. Allow anyone to verify — all reads are free (view functions).
 * 6. Industry-grade controls: ownership transfer, two-step handover,
 *    pausable writes for emergency, batch anchoring, anchorer role.
 *
 * ── What is NOT stored on-chain ──
 * - The actual review text (too expensive; stored on IPFS).
 * - User PII — only a keccak256 hash of the reviewer's platform ID.
 *
 * ── Security Considerations ──
 * - Owner + designated anchorers can anchor proofs.
 * - reviewIdHash uniqueness enforced at the contract level.
 * - No selfdestruct, no upgradability — proof record is permanent.
 * - Pausable: stops *new* anchors only; reads always available.
 */
contract ReviewProof {
    // ─── State ───

    address public owner;
    address public pendingOwner;

    /// @dev Authorized service wallets allowed to anchor reviews (in addition to owner).
    mapping(address => bool) public anchorers;

    /// @dev Emergency pause flag — disables anchorReview / batchAnchorReviews when true.
    bool public paused;

    struct Proof {
        bytes32 contentHash;     // SHA-256 of canonical review JSON
        bytes32 ipfsCidHash;     // keccak256(ipfsCid)
        bytes32 productIdHash;   // keccak256(productId)
        bytes32 orderIdHash;     // keccak256(orderId)
        bytes32 reviewerHash;    // keccak256(userId)
        uint64  timestamp;       // block.timestamp at anchoring
        bool    exists;          // guard flag
    }

    /// @dev reviewIdHash => Proof. Key is keccak256(mongoReviewId).
    mapping(bytes32 => Proof) private _proofs;

    /// @dev Total number of anchored proofs.
    uint256 public proofCount;

    // ─── Events ───

    event ReviewAnchored(
        bytes32 indexed reviewIdHash,
        bytes32 indexed productIdHash,
        bytes32 indexed reviewerHash,
        bytes32 contentHash,
        bytes32 ipfsCidHash,
        bytes32 orderIdHash,
        uint64  timestamp
    );
    event OwnershipTransferStarted(address indexed currentOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event AnchorerUpdated(address indexed account, bool authorized);
    event PausedSet(bool paused);

    // ─── Errors ───

    error Unauthorized();
    error DuplicateProof(bytes32 reviewIdHash);
    error InvalidHash();
    error ZeroAddress();
    error ContractPaused();
    error LengthMismatch();
    error EmptyBatch();
    error BatchTooLarge();

    // ─── Constants ───

    uint256 public constant MAX_BATCH_SIZE = 100;

    // ─── Constructor ───

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ─── Modifiers ───

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyAnchorer() {
        if (msg.sender != owner && !anchorers[msg.sender]) revert Unauthorized();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    // ─── Admin: Ownership (two-step) ───

    /// @notice Begin transfer of ownership. New owner must `acceptOwnership` to finalize.
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /// @notice Pending owner accepts the transfer.
    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert Unauthorized();
        address previous = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(previous, owner);
    }

    // ─── Admin: Anchorer role ───

    function setAnchorer(address account, bool authorized) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        anchorers[account] = authorized;
        emit AnchorerUpdated(account, authorized);
    }

    // ─── Admin: Emergency Pause ───

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit PausedSet(_paused);
    }

    // ─── Write: Anchor a Review Proof ───

    /**
     * @notice Anchors an immutable proof record for a verified review.
     */
    function anchorReview(
        bytes32 reviewIdHash,
        bytes32 contentHash,
        bytes32 ipfsCidHash,
        bytes32 productIdHash,
        bytes32 orderIdHash,
        bytes32 reviewerHash
    ) external onlyAnchorer whenNotPaused {
        _anchor(reviewIdHash, contentHash, ipfsCidHash, productIdHash, orderIdHash, reviewerHash);
    }

    /**
     * @notice Batch anchor multiple proofs in a single transaction.
     * @dev All arrays must be the same length, 1..MAX_BATCH_SIZE.
     */
    function batchAnchorReviews(
        bytes32[] calldata reviewIdHashes,
        bytes32[] calldata contentHashes,
        bytes32[] calldata ipfsCidHashes,
        bytes32[] calldata productIdHashes,
        bytes32[] calldata orderIdHashes,
        bytes32[] calldata reviewerHashes
    ) external onlyAnchorer whenNotPaused {
        uint256 len = reviewIdHashes.length;
        if (len == 0) revert EmptyBatch();
        if (len > MAX_BATCH_SIZE) revert BatchTooLarge();
        if (
            contentHashes.length != len ||
            ipfsCidHashes.length != len ||
            productIdHashes.length != len ||
            orderIdHashes.length != len ||
            reviewerHashes.length != len
        ) revert LengthMismatch();

        for (uint256 i = 0; i < len; ) {
            _anchor(
                reviewIdHashes[i],
                contentHashes[i],
                ipfsCidHashes[i],
                productIdHashes[i],
                orderIdHashes[i],
                reviewerHashes[i]
            );
            unchecked { ++i; }
        }
    }

    function _anchor(
        bytes32 reviewIdHash,
        bytes32 contentHash,
        bytes32 ipfsCidHash,
        bytes32 productIdHash,
        bytes32 orderIdHash,
        bytes32 reviewerHash
    ) internal {
        if (reviewIdHash == bytes32(0) || contentHash == bytes32(0) || ipfsCidHash == bytes32(0)) {
            revert InvalidHash();
        }
        if (_proofs[reviewIdHash].exists) {
            revert DuplicateProof(reviewIdHash);
        }

        uint64 ts = uint64(block.timestamp);
        _proofs[reviewIdHash] = Proof({
            contentHash: contentHash,
            ipfsCidHash: ipfsCidHash,
            productIdHash: productIdHash,
            orderIdHash: orderIdHash,
            reviewerHash: reviewerHash,
            timestamp: ts,
            exists: true
        });

        unchecked { proofCount++; }

        emit ReviewAnchored(
            reviewIdHash,
            productIdHash,
            reviewerHash,
            contentHash,
            ipfsCidHash,
            orderIdHash,
            ts
        );
    }

    // ─── Read: Verify a Review Proof ───

    function getProof(bytes32 reviewIdHash) external view returns (Proof memory) {
        return _proofs[reviewIdHash];
    }

    function hasProof(bytes32 reviewIdHash) external view returns (bool) {
        return _proofs[reviewIdHash].exists;
    }

    function verifyContent(bytes32 reviewIdHash, bytes32 contentHash) external view returns (bool) {
        Proof storage p = _proofs[reviewIdHash];
        return p.exists && p.contentHash == contentHash;
    }

    /// @notice Returns timestamp for an anchored proof (0 if not anchored).
    function anchoredAt(bytes32 reviewIdHash) external view returns (uint64) {
        return _proofs[reviewIdHash].timestamp;
    }
}
