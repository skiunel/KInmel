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
 * 3. Link the proof to the IPFS document (ipfsCidHash) where full
 *    review content is stored.
 * 4. Prevent duplicate anchoring for the same review.
 * 5. Allow anyone to verify — all reads are free (view functions).
 *
 * ── What is NOT stored on-chain ──
 * - The actual review text (too expensive; stored on IPFS).
 * - User PII — only a keccak256 hash of the reviewer's platform ID.
 *
 * ── Security Considerations ──
 * - Only the contract owner (backend service wallet) can anchor proofs,
 *   preventing spam and unauthorized writes.
 * - The reviewId → proof mapping uses a unique MongoDB _id hash, so
 *   duplicates are impossible at the contract level.
 * - All stored hashes are bytes32 (keccak256), keeping storage costs
 *   fixed and predictable.
 * - No selfdestruct, no upgradability — the proof record is permanent.
 */
contract ReviewProof {
    // ─── State ───

    address public immutable owner;

    struct Proof {
        bytes32 contentHash;     // SHA-256 of canonical review JSON, cast to bytes32
        bytes32 ipfsCidHash;     // keccak256(ipfsCid) — verifiable link to IPFS
        bytes32 productIdHash;   // keccak256(productId)
        bytes32 orderIdHash;     // keccak256(orderId)
        bytes32 reviewerHash;    // keccak256(userId) — pseudonymous identity
        uint64  timestamp;       // block.timestamp at anchoring
        bool    exists;          // guard flag for existence checks
    }

    /// @dev reviewIdHash => Proof. Key is keccak256(mongoReviewId).
    mapping(bytes32 => Proof) private _proofs;

    /// @dev Total number of anchored proofs.
    uint256 public proofCount;

    // ─── Events ───

    event ReviewAnchored(
        bytes32 indexed reviewIdHash,
        bytes32 indexed productIdHash,
        bytes32 contentHash,
        bytes32 ipfsCidHash,
        uint64  timestamp
    );

    // ─── Errors ───

    error Unauthorized();
    error DuplicateProof(bytes32 reviewIdHash);
    error InvalidHash();

    // ─── Constructor ───

    constructor() {
        owner = msg.sender;
    }

    // ─── Modifiers ───

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    // ─── Write: Anchor a Review Proof ───

    /**
     * @notice Anchors an immutable proof record for a verified review.
     * @param reviewIdHash  keccak256 of the MongoDB review _id
     * @param contentHash   SHA-256 of the canonical review JSON (from IPFS service)
     * @param ipfsCidHash   keccak256 of the IPFS CID string
     * @param productIdHash keccak256 of the product ID
     * @param orderIdHash   keccak256 of the order ID
     * @param reviewerHash  keccak256 of the user ID
     */
    function anchorReview(
        bytes32 reviewIdHash,
        bytes32 contentHash,
        bytes32 ipfsCidHash,
        bytes32 productIdHash,
        bytes32 orderIdHash,
        bytes32 reviewerHash
    ) external onlyOwner {
        if (contentHash == bytes32(0) || ipfsCidHash == bytes32(0)) {
            revert InvalidHash();
        }
        if (_proofs[reviewIdHash].exists) {
            revert DuplicateProof(reviewIdHash);
        }

        _proofs[reviewIdHash] = Proof({
            contentHash: contentHash,
            ipfsCidHash: ipfsCidHash,
            productIdHash: productIdHash,
            orderIdHash: orderIdHash,
            reviewerHash: reviewerHash,
            timestamp: uint64(block.timestamp),
            exists: true
        });

        unchecked { proofCount++; }

        emit ReviewAnchored(
            reviewIdHash,
            productIdHash,
            contentHash,
            ipfsCidHash,
            uint64(block.timestamp)
        );
    }

    // ─── Read: Verify a Review Proof ───

    /**
     * @notice Returns the full proof record for a given review.
     * @param reviewIdHash keccak256 of the MongoDB review _id
     * @return The Proof struct (exists=false if not found)
     */
    function getProof(bytes32 reviewIdHash)
        external
        view
        returns (Proof memory)
    {
        return _proofs[reviewIdHash];
    }

    /**
     * @notice Quick existence check.
     */
    function hasProof(bytes32 reviewIdHash)
        external
        view
        returns (bool)
    {
        return _proofs[reviewIdHash].exists;
    }

    /**
     * @notice Verifies that a content hash matches what was anchored.
     * @param reviewIdHash  keccak256 of the review _id
     * @param contentHash   The content hash to verify against
     * @return matched True if the hashes match
     */
    function verifyContent(bytes32 reviewIdHash, bytes32 contentHash)
        external
        view
        returns (bool matched)
    {
        Proof storage p = _proofs[reviewIdHash];
        return p.exists && p.contentHash == contentHash;
    }
}
