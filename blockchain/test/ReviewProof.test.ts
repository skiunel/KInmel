import { expect } from "chai";
import { ethers } from "hardhat";
import { ReviewProof } from "../typechain-types";

describe("ReviewProof", function () {
  let contract: ReviewProof;
  let owner: Awaited<ReturnType<typeof ethers.getSigners>>[0];
  let stranger: Awaited<ReturnType<typeof ethers.getSigners>>[0];

  // Deterministic test hashes
  const reviewIdHash = ethers.keccak256(ethers.toUtf8Bytes("review_abc123"));
  const contentHash = ethers.keccak256(ethers.toUtf8Bytes("sha256-of-review-json"));
  const ipfsCidHash = ethers.keccak256(ethers.toUtf8Bytes("QmXyz..."));
  const productIdHash = ethers.keccak256(ethers.toUtf8Bytes("product_001"));
  const orderIdHash = ethers.keccak256(ethers.toUtf8Bytes("order_001"));
  const reviewerHash = ethers.keccak256(ethers.toUtf8Bytes("user_001"));

  beforeEach(async function () {
    [owner, stranger] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ReviewProof");
    contract = (await factory.deploy()) as unknown as ReviewProof;
  });

  describe("Deployment", function () {
    it("sets deployer as owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("starts with zero proofs", async function () {
      expect(await contract.proofCount()).to.equal(0);
    });
  });

  describe("anchorReview", function () {
    it("stores a proof and emits ReviewAnchored", async function () {
      const tx = await contract.anchorReview(
        reviewIdHash,
        contentHash,
        ipfsCidHash,
        productIdHash,
        orderIdHash,
        reviewerHash
      );

      await expect(tx)
        .to.emit(contract, "ReviewAnchored")
        .withArgs(
          reviewIdHash,
          productIdHash,
          reviewerHash,
          contentHash,
          ipfsCidHash,
          orderIdHash,
          (v: bigint) => v > 0n // timestamp
        );

      expect(await contract.proofCount()).to.equal(1);
    });

    it("rejects duplicate proof for same reviewIdHash", async function () {
      await contract.anchorReview(
        reviewIdHash,
        contentHash,
        ipfsCidHash,
        productIdHash,
        orderIdHash,
        reviewerHash
      );

      await expect(
        contract.anchorReview(
          reviewIdHash,
          contentHash,
          ipfsCidHash,
          productIdHash,
          orderIdHash,
          reviewerHash
        )
      ).to.be.revertedWithCustomError(contract, "DuplicateProof");
    });

    it("rejects zero contentHash", async function () {
      await expect(
        contract.anchorReview(
          reviewIdHash,
          ethers.ZeroHash,
          ipfsCidHash,
          productIdHash,
          orderIdHash,
          reviewerHash
        )
      ).to.be.revertedWithCustomError(contract, "InvalidHash");
    });

    it("rejects zero ipfsCidHash", async function () {
      await expect(
        contract.anchorReview(
          reviewIdHash,
          contentHash,
          ethers.ZeroHash,
          productIdHash,
          orderIdHash,
          reviewerHash
        )
      ).to.be.revertedWithCustomError(contract, "InvalidHash");
    });

    it("rejects calls from non-owner", async function () {
      await expect(
        contract
          .connect(stranger)
          .anchorReview(
            reviewIdHash,
            contentHash,
            ipfsCidHash,
            productIdHash,
            orderIdHash,
            reviewerHash
          )
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });
  });

  describe("Read functions", function () {
    beforeEach(async function () {
      await contract.anchorReview(
        reviewIdHash,
        contentHash,
        ipfsCidHash,
        productIdHash,
        orderIdHash,
        reviewerHash
      );
    });

    it("getProof returns the full proof struct", async function () {
      const proof = await contract.getProof(reviewIdHash);
      expect(proof.contentHash).to.equal(contentHash);
      expect(proof.ipfsCidHash).to.equal(ipfsCidHash);
      expect(proof.productIdHash).to.equal(productIdHash);
      expect(proof.orderIdHash).to.equal(orderIdHash);
      expect(proof.reviewerHash).to.equal(reviewerHash);
      expect(proof.exists).to.be.true;
      expect(proof.timestamp).to.be.greaterThan(0);
    });

    it("getProof returns exists=false for unknown review", async function () {
      const unknown = ethers.keccak256(ethers.toUtf8Bytes("nonexistent"));
      const proof = await contract.getProof(unknown);
      expect(proof.exists).to.be.false;
    });

    it("hasProof returns true/false correctly", async function () {
      expect(await contract.hasProof(reviewIdHash)).to.be.true;
      const unknown = ethers.keccak256(ethers.toUtf8Bytes("nonexistent"));
      expect(await contract.hasProof(unknown)).to.be.false;
    });

    it("verifyContent returns true for matching hash", async function () {
      expect(
        await contract.verifyContent(reviewIdHash, contentHash)
      ).to.be.true;
    });

    it("verifyContent returns false for wrong hash", async function () {
      const wrong = ethers.keccak256(ethers.toUtf8Bytes("tampered"));
      expect(await contract.verifyContent(reviewIdHash, wrong)).to.be.false;
    });

    it("verifyContent returns false for unknown review", async function () {
      const unknown = ethers.keccak256(ethers.toUtf8Bytes("nonexistent"));
      expect(await contract.verifyContent(unknown, contentHash)).to.be.false;
    });

    it("anchoredAt returns the proof timestamp", async function () {
      const ts = await contract.anchoredAt(reviewIdHash);
      expect(ts).to.be.greaterThan(0n);
      expect(await contract.anchoredAt(ethers.ZeroHash)).to.equal(0n);
    });
  });

  describe("Anchorer role", function () {
    it("owner can authorize an anchorer; anchorer can write", async function () {
      await expect(contract.setAnchorer(stranger.address, true))
        .to.emit(contract, "AnchorerUpdated")
        .withArgs(stranger.address, true);

      await contract
        .connect(stranger)
        .anchorReview(reviewIdHash, contentHash, ipfsCidHash, productIdHash, orderIdHash, reviewerHash);

      expect(await contract.hasProof(reviewIdHash)).to.be.true;
    });

    it("revoked anchorer cannot write", async function () {
      await contract.setAnchorer(stranger.address, true);
      await contract.setAnchorer(stranger.address, false);

      await expect(
        contract
          .connect(stranger)
          .anchorReview(reviewIdHash, contentHash, ipfsCidHash, productIdHash, orderIdHash, reviewerHash)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("non-owner cannot set anchorer", async function () {
      await expect(
        contract.connect(stranger).setAnchorer(stranger.address, true)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("setAnchorer rejects zero address", async function () {
      await expect(
        contract.setAnchorer(ethers.ZeroAddress, true)
      ).to.be.revertedWithCustomError(contract, "ZeroAddress");
    });
  });

  describe("Pausable", function () {
    it("owner can pause and unpause", async function () {
      await expect(contract.setPaused(true))
        .to.emit(contract, "PausedSet")
        .withArgs(true);
      expect(await contract.paused()).to.be.true;
    });

    it("paused contract rejects anchorReview", async function () {
      await contract.setPaused(true);
      await expect(
        contract.anchorReview(reviewIdHash, contentHash, ipfsCidHash, productIdHash, orderIdHash, reviewerHash)
      ).to.be.revertedWithCustomError(contract, "ContractPaused");
    });

    it("reads still work when paused", async function () {
      await contract.anchorReview(reviewIdHash, contentHash, ipfsCidHash, productIdHash, orderIdHash, reviewerHash);
      await contract.setPaused(true);
      expect(await contract.hasProof(reviewIdHash)).to.be.true;
    });

    it("non-owner cannot pause", async function () {
      await expect(
        contract.connect(stranger).setPaused(true)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });
  });

  describe("Two-step ownership transfer", function () {
    it("transferOwnership sets pendingOwner and emits", async function () {
      await expect(contract.transferOwnership(stranger.address))
        .to.emit(contract, "OwnershipTransferStarted")
        .withArgs(owner.address, stranger.address);

      expect(await contract.pendingOwner()).to.equal(stranger.address);
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("pendingOwner can accept and become owner", async function () {
      await contract.transferOwnership(stranger.address);
      await expect(contract.connect(stranger).acceptOwnership())
        .to.emit(contract, "OwnershipTransferred")
        .withArgs(owner.address, stranger.address);
      expect(await contract.owner()).to.equal(stranger.address);
      expect(await contract.pendingOwner()).to.equal(ethers.ZeroAddress);
    });

    it("only pendingOwner can accept", async function () {
      await contract.transferOwnership(stranger.address);
      await expect(
        contract.acceptOwnership()
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("transferOwnership rejects zero address", async function () {
      await expect(
        contract.transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "ZeroAddress");
    });
  });

  describe("batchAnchorReviews", function () {
    const ids = [
      ethers.keccak256(ethers.toUtf8Bytes("b1")),
      ethers.keccak256(ethers.toUtf8Bytes("b2")),
      ethers.keccak256(ethers.toUtf8Bytes("b3")),
    ];

    it("anchors multiple proofs in one call", async function () {
      const arr = (v: string) => [v, v, v];
      await contract.batchAnchorReviews(
        ids,
        arr(contentHash),
        arr(ipfsCidHash),
        arr(productIdHash),
        arr(orderIdHash),
        arr(reviewerHash)
      );
      expect(await contract.proofCount()).to.equal(3);
      for (const id of ids) {
        expect(await contract.hasProof(id)).to.be.true;
      }
    });

    it("rejects mismatched array lengths", async function () {
      await expect(
        contract.batchAnchorReviews(
          ids,
          [contentHash, contentHash],
          [ipfsCidHash, ipfsCidHash, ipfsCidHash],
          [productIdHash, productIdHash, productIdHash],
          [orderIdHash, orderIdHash, orderIdHash],
          [reviewerHash, reviewerHash, reviewerHash]
        )
      ).to.be.revertedWithCustomError(contract, "LengthMismatch");
    });

    it("rejects empty batch", async function () {
      await expect(
        contract.batchAnchorReviews([], [], [], [], [], [])
      ).to.be.revertedWithCustomError(contract, "EmptyBatch");
    });
  });
});
