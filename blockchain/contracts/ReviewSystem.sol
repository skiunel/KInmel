// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ReviewSystem
 * @notice Kinmel on-chain review registry. Stores review proofs tied to verified purchases.
 *
 * - Only the contract owner (backend service) can mark a purchase as verified.
 * - Only a buyer with a verified purchase can submit a review for that product.
 * - Reviews are immutable once published.
 * - Content hash references off-chain review payload (IPFS).
 */
contract ReviewSystem {
    struct Review {
        address reviewer;
        uint256 productId;
        uint8 rating;
        string contentHash;
        uint256 timestamp;
        bool verified;
    }

    address public owner;

    mapping(uint256 => Review[]) private productReviews;
    mapping(address => mapping(uint256 => bool)) public hasPurchased;
    mapping(address => mapping(uint256 => bool)) public hasReviewed;

    uint256 public totalReviews;

    event PurchaseMarked(address indexed buyer, uint256 indexed productId);
    event ReviewSubmitted(
        address indexed reviewer,
        uint256 indexed productId,
        uint8 rating,
        string contentHash,
        uint256 timestamp
    );
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error NotPurchaser();
    error AlreadyReviewed();
    error InvalidRating();
    error EmptyContent();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero addr");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /// @notice Mark a buyer's purchase as verified. Called by backend after payment confirmation.
    function markPurchased(address buyer, uint256 productId) external onlyOwner {
        hasPurchased[buyer][productId] = true;
        emit PurchaseMarked(buyer, productId);
    }

    /// @notice Batch mark purchases for efficiency.
    function batchMarkPurchased(address buyer, uint256[] calldata productIds) external onlyOwner {
        for (uint256 i = 0; i < productIds.length; i++) {
            hasPurchased[buyer][productIds[i]] = true;
            emit PurchaseMarked(buyer, productIds[i]);
        }
    }

    /// @notice Submit a review. Caller must have a verified purchase for the product.
    function submitReview(
        uint256 productId,
        uint8 rating,
        string calldata contentHash
    ) external {
        if (!hasPurchased[msg.sender][productId]) revert NotPurchaser();
        if (hasReviewed[msg.sender][productId]) revert AlreadyReviewed();
        if (rating < 1 || rating > 5) revert InvalidRating();
        if (bytes(contentHash).length == 0) revert EmptyContent();

        productReviews[productId].push(
            Review({
                reviewer: msg.sender,
                productId: productId,
                rating: rating,
                contentHash: contentHash,
                timestamp: block.timestamp,
                verified: true
            })
        );

        hasReviewed[msg.sender][productId] = true;
        unchecked { totalReviews++; }

        emit ReviewSubmitted(msg.sender, productId, rating, contentHash, block.timestamp);
    }

    function getReviews(uint256 productId) external view returns (Review[] memory) {
        return productReviews[productId];
    }

    function getReviewCount(uint256 productId) external view returns (uint256) {
        return productReviews[productId].length;
    }

    function getAverageRating(uint256 productId) external view returns (uint256) {
        Review[] memory reviews = productReviews[productId];
        if (reviews.length == 0) return 0;
        uint256 sum;
        for (uint256 i = 0; i < reviews.length; i++) {
            sum += reviews[i].rating;
        }
        // Returns rating * 100 to preserve 2 decimal precision
        return (sum * 100) / reviews.length;
    }
}
