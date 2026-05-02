import { ethers } from 'ethers';
import { env } from '../config/env';

// ─── ABI (only the functions we call) ───
// Extracted from the compiled contract to avoid importing Hardhat artifacts.

const REVIEW_PROOF_ABI = [
  'function anchorReview(bytes32 reviewIdHash, bytes32 contentHash, bytes32 ipfsCidHash, bytes32 productIdHash, bytes32 orderIdHash, bytes32 reviewerHash) external',
  'function getProof(bytes32 reviewIdHash) external view returns (tuple(bytes32 contentHash, bytes32 ipfsCidHash, bytes32 productIdHash, bytes32 orderIdHash, bytes32 reviewerHash, uint64 timestamp, bool exists))',
  'function hasProof(bytes32 reviewIdHash) external view returns (bool)',
  'function verifyContent(bytes32 reviewIdHash, bytes32 contentHash) external view returns (bool)',
  'event ReviewAnchored(bytes32 indexed reviewIdHash, bytes32 indexed productIdHash, bytes32 contentHash, bytes32 ipfsCidHash, uint64 timestamp)',
] as const;

// ─── Types ───

export interface AnchorInput {
  reviewId: string;
  contentHash: string; // hex SHA-256 from IPFS service
  ipfsCid: string;
  productId: string;
  orderId: string;
  userId: string;
}

export interface AnchorResult {
  txHash: string;
  blockNumber: number;
  contractAddress: string;
  gasUsed: string;
}

export interface OnChainProof {
  contentHash: string;
  ipfsCidHash: string;
  productIdHash: string;
  orderIdHash: string;
  reviewerHash: string;
  timestamp: number;
  exists: boolean;
}

// ─── Helpers ───

function toBytes32(hexString: string): string {
  // contentHash is a hex SHA-256 (64 chars). Pad to bytes32.
  const clean = hexString.startsWith('0x') ? hexString : `0x${hexString}`;
  return ethers.zeroPadValue(clean, 32);
}

function idHash(value: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(value));
}

// ─── Provider & Contract (lazy singleton) ───

let _provider: ethers.JsonRpcProvider | null = null;
let _contract: ethers.Contract | null = null;
let _readContract: ethers.Contract | null = null;

function isConfigured(): boolean {
  return !!(
    env.BLOCKCHAIN_RPC_URL &&
    env.REVIEW_CONTRACT_ADDRESS &&
    env.DEPLOYER_PRIVATE_KEY
  );
}

function getProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
  }
  return _provider;
}

function getWriteContract(): ethers.Contract {
  if (!_contract) {
    const provider = getProvider();
    const signer = new ethers.Wallet(env.DEPLOYER_PRIVATE_KEY!, provider);
    _contract = new ethers.Contract(
      env.REVIEW_CONTRACT_ADDRESS!,
      REVIEW_PROOF_ABI,
      signer
    );
  }
  return _contract;
}

function getReadContract(): ethers.Contract {
  if (!_readContract) {
    const provider = getProvider();
    _readContract = new ethers.Contract(
      env.REVIEW_CONTRACT_ADDRESS!,
      REVIEW_PROOF_ABI,
      provider
    );
  }
  return _readContract;
}

// ─── Write: Anchor Review Proof ───

export async function anchorReviewOnChain(
  input: AnchorInput
): Promise<AnchorResult> {
  if (!isConfigured()) {
    throw new Error('Blockchain not configured — set BLOCKCHAIN_RPC_URL, REVIEW_CONTRACT_ADDRESS, DEPLOYER_PRIVATE_KEY');
  }

  const contract = getWriteContract();

  const reviewIdHash = idHash(input.reviewId);
  const contentHash = toBytes32(input.contentHash);
  const ipfsCidHash = idHash(input.ipfsCid);
  const productIdHash = idHash(input.productId);
  const orderIdHash = idHash(input.orderId);
  const reviewerHash = idHash(input.userId);

  const tx = await contract.anchorReview(
    reviewIdHash,
    contentHash,
    ipfsCidHash,
    productIdHash,
    orderIdHash,
    reviewerHash
  );

  const receipt = await tx.wait();

  return {
    txHash: receipt.hash as string,
    blockNumber: receipt.blockNumber as number,
    contractAddress: env.REVIEW_CONTRACT_ADDRESS!,
    gasUsed: receipt.gasUsed.toString(),
  };
}

// ─── Read: Verify Review On-Chain ───

export async function verifyReviewOnChain(
  reviewId: string,
  contentHash: string
): Promise<{ exists: boolean; verified: boolean; proof: OnChainProof | null }> {
  if (!isConfigured()) {
    return { exists: false, verified: false, proof: null };
  }

  const contract = getReadContract();
  const reviewIdHash = idHash(reviewId);

  const raw = await contract.getProof(reviewIdHash);

  if (!raw.exists) {
    return { exists: false, verified: false, proof: null };
  }

  const contentBytes32 = toBytes32(contentHash);
  const verified = await contract.verifyContent(reviewIdHash, contentBytes32);

  return {
    exists: true,
    verified: verified as boolean,
    proof: {
      contentHash: raw.contentHash as string,
      ipfsCidHash: raw.ipfsCidHash as string,
      productIdHash: raw.productIdHash as string,
      orderIdHash: raw.orderIdHash as string,
      reviewerHash: raw.reviewerHash as string,
      timestamp: Number(raw.timestamp),
      exists: true,
    },
  };
}

// ─── Read: Quick Check ───

export async function hasProofOnChain(reviewId: string): Promise<boolean> {
  if (!isConfigured()) return false;
  const contract = getReadContract();
  return contract.hasProof(idHash(reviewId)) as Promise<boolean>;
}

// ─── Status Check ───

export function isBlockchainConfigured(): boolean {
  return isConfigured();
}
