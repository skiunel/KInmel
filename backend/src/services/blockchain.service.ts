import { ethers } from 'ethers';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// ─── ABI (only the functions we call) ───
// Extracted from the compiled contract to avoid importing Hardhat artifacts.

const REVIEW_PROOF_ABI = [
  'function anchorReview(bytes32 reviewIdHash, bytes32 contentHash, bytes32 ipfsCidHash, bytes32 productIdHash, bytes32 orderIdHash, bytes32 reviewerHash) external',
  'function batchAnchorReviews(bytes32[] reviewIdHashes, bytes32[] contentHashes, bytes32[] ipfsCidHashes, bytes32[] productIdHashes, bytes32[] orderIdHashes, bytes32[] reviewerHashes) external',
  'function getProof(bytes32 reviewIdHash) external view returns (tuple(bytes32 contentHash, bytes32 ipfsCidHash, bytes32 productIdHash, bytes32 orderIdHash, bytes32 reviewerHash, uint64 timestamp, bool exists))',
  'function hasProof(bytes32 reviewIdHash) external view returns (bool)',
  'function verifyContent(bytes32 reviewIdHash, bytes32 contentHash) external view returns (bool)',
  'function anchoredAt(bytes32 reviewIdHash) external view returns (uint64)',
  'function proofCount() external view returns (uint256)',
  'function paused() external view returns (bool)',
  'function owner() external view returns (address)',
  'event ReviewAnchored(bytes32 indexed reviewIdHash, bytes32 indexed productIdHash, bytes32 indexed reviewerHash, bytes32 contentHash, bytes32 ipfsCidHash, bytes32 orderIdHash, uint64 timestamp)',
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
  explorerUrl: string;
  network: NetworkInfo;
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

export interface NetworkInfo {
  chainId: number;
  name: string;
  explorerUrl: string;
  rpcUrl: string;
}

export interface BlockchainStatus {
  configured: boolean;
  connected: boolean;
  network: NetworkInfo | null;
  contractAddress: string | null;
  proofCount: number;
  paused: boolean;
  signerAddress: string | null;
  signerBalance: string | null;
}

// ─── Network registry ───

const KNOWN_NETWORKS: Record<number, { name: string; explorerUrl: string }> = {
  1: { name: 'Ethereum Mainnet', explorerUrl: 'https://etherscan.io' },
  137: { name: 'Polygon', explorerUrl: 'https://polygonscan.com' },
  80001: { name: 'Polygon Mumbai', explorerUrl: 'https://mumbai.polygonscan.com' },
  80002: { name: 'Polygon Amoy', explorerUrl: 'https://amoy.polygonscan.com' },
  1337: { name: 'Localhost', explorerUrl: '' },
  31337: { name: 'Hardhat', explorerUrl: '' },
};

// ─── Helpers ───

function toBytes32(hexString: string): string {
  const clean = hexString.startsWith('0x') ? hexString : `0x${hexString}`;
  return ethers.zeroPadValue(clean, 32);
}

function idHash(value: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(value));
}

function buildExplorerTxUrl(network: NetworkInfo, txHash: string): string {
  if (!network.explorerUrl) return '';
  return `${network.explorerUrl}/tx/${txHash}`;
}

export function buildExplorerAddressUrl(network: NetworkInfo, address: string): string {
  if (!network.explorerUrl) return '';
  return `${network.explorerUrl}/address/${address}`;
}

// ─── Provider & Contract (lazy singleton) ───

let _provider: ethers.JsonRpcProvider | null = null;
let _signer: ethers.Wallet | null = null;
let _writeContract: ethers.Contract | null = null;
let _readContract: ethers.Contract | null = null;
let _networkInfo: NetworkInfo | null = null;

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function isConfigured(): boolean {
  return !!(
    env.BLOCKCHAIN_RPC_URL &&
    env.REVIEW_CONTRACT_ADDRESS &&
    env.REVIEW_CONTRACT_ADDRESS.toLowerCase() !== ZERO_ADDRESS &&
    env.DEPLOYER_PRIVATE_KEY
  );
}

// Reset all singletons so the next call re-creates fresh connections.
// Called when a fatal RPC/network error is detected.
function resetSingletons(): void {
  _provider = null;
  _signer = null;
  _writeContract = null;
  _readContract = null;
  _networkInfo = null;
}

function getProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
  }
  return _provider;
}

function getSigner(): ethers.Wallet {
  if (!_signer) {
    _signer = new ethers.Wallet(env.DEPLOYER_PRIVATE_KEY!, getProvider());
  }
  return _signer;
}

function getWriteContract(): ethers.Contract {
  if (!_writeContract) {
    _writeContract = new ethers.Contract(
      env.REVIEW_CONTRACT_ADDRESS!,
      REVIEW_PROOF_ABI,
      getSigner()
    );
  }
  return _writeContract;
}

function getReadContract(): ethers.Contract {
  if (!_readContract) {
    _readContract = new ethers.Contract(
      env.REVIEW_CONTRACT_ADDRESS!,
      REVIEW_PROOF_ABI,
      getProvider()
    );
  }
  return _readContract;
}

// Returns true for errors that indicate a contract-level revert (CALL_EXCEPTION).
// These are deterministic — retrying will not help and wastes gas.
function isContractRevert(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; data?: string };
  return e.code === 'CALL_EXCEPTION';
}

// Decode custom-error reverts from ReviewProof contract so logs/UI show
// the real cause (Unauthorized / ContractPaused / DuplicateProof / ...)
// instead of the opaque "missing revert data" message ethers emits when
// the revert payload is a 4-byte custom-error selector.
function decodeContractError(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null;
  const e = err as { data?: string; info?: { error?: { data?: string } }; error?: { data?: string } };
  const data: string | undefined =
    e.data ?? e.info?.error?.data ?? e.error?.data;
  if (!data || typeof data !== 'string' || data.length < 10) return null;
  try {
    const iface = new ethers.Interface(REVIEW_PROOF_ABI as unknown as string[]);
    const parsed = iface.parseError(data);
    if (!parsed) return null;
    if (parsed.name === 'DuplicateProof') return 'DuplicateProof (review already anchored)';
    if (parsed.name === 'Unauthorized') return 'Unauthorized (signer is not contract owner/anchorer)';
    if (parsed.name === 'ContractPaused') return 'ContractPaused (anchoring disabled by owner)';
    return parsed.name;
  } catch {
    return null;
  }
}

// Returns true for errors that indicate a broken RPC connection and warrant
// resetting the provider singleton before retrying.
function isFatalNetworkError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string };
  return (
    e.code === 'NETWORK_ERROR' ||
    e.code === 'SERVER_ERROR' ||
    e.code === 'TIMEOUT'
  );
}

export async function getNetworkInfo(): Promise<NetworkInfo> {
  if (_networkInfo) return _networkInfo;
  const network = await getProvider().getNetwork();
  const chainId = Number(network.chainId);
  const known = KNOWN_NETWORKS[chainId] ?? { name: network.name || 'Unknown', explorerUrl: '' };
  _networkInfo = {
    chainId,
    name: known.name,
    explorerUrl: known.explorerUrl,
    rpcUrl: env.BLOCKCHAIN_RPC_URL ?? '',
  };
  return _networkInfo;
}

// ─── Retry helper ───

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // Contract reverts are deterministic — never retry, they waste gas.
      if (isContractRevert(err)) {
        logger.warn('blockchain call hit contract revert — not retrying', err);
        throw err;
      }
      // Fatal network errors mean the provider is broken — reset singletons
      // so the next attempt creates a fresh connection.
      if (isFatalNetworkError(err)) {
        logger.warn('fatal RPC error — resetting blockchain singletons', err);
        resetSingletons();
      }
      logger.warn(`blockchain call attempt ${attempt} failed`, err);
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs * attempt));
      }
    }
  }
  throw lastErr;
}

// ─── Write: Anchor Review Proof ───

export async function anchorReviewOnChain(input: AnchorInput): Promise<AnchorResult> {
  if (env.BLOCKCHAIN_DEMO_MODE) {
    return simulateAnchor(input);
  }
  if (!isConfigured()) {
    throw new Error(
      'Blockchain not configured — set BLOCKCHAIN_RPC_URL, REVIEW_CONTRACT_ADDRESS, DEPLOYER_PRIVATE_KEY'
    );
  }

  const contract = getWriteContract();
  const network = await getNetworkInfo();

  const reviewIdHash = idHash(input.reviewId);
  const contentHash = toBytes32(input.contentHash);
  const ipfsCidHash = idHash(input.ipfsCid);
  const productIdHash = idHash(input.productId);
  const orderIdHash = idHash(input.orderId);
  const reviewerHash = idHash(input.userId);

  // Dedupe: if proof already on-chain, surface that as DuplicateProof
  // rather than burning gas on a revert. Lets caller recover the existing
  // anchor via getRecentAnchoredEvents or skip cleanly.
  try {
    const already = (await getReadContract().hasProof(reviewIdHash)) as boolean;
    if (already) throw new Error('DuplicateProof (review already anchored)');
  } catch (e) {
    if ((e as Error).message?.startsWith('DuplicateProof')) throw e;
    // read-side failure: fall through to attempt and let the write surface it
  }

  // anchorReview writes 7 bytes32 slots — gas is fixed and small. Pass an
  // explicit gasLimit so ethers skips eth_estimateGas, whose simulation on
  // Amoy intermittently fails with "missing revert data (action=estimateGas)"
  // even for valid txs. A real revert still surfaces on tx.wait().
  const overrides = await buildGasOverrides(250_000n);
  await assertSignerFunded(overrides);

  const receipt = await withRetry(async () => {
    try {
      const tx = await contract.anchorReview(
        reviewIdHash,
        contentHash,
        ipfsCidHash,
        productIdHash,
        orderIdHash,
        reviewerHash,
        overrides
      );
      return await tx.wait();
    } catch (err) {
      const decoded = decodeContractError(err);
      if (decoded) throw new Error(decoded);
      throw err;
    }
  });

  if (!receipt) throw new Error('Transaction receipt unavailable');

  return {
    txHash: receipt.hash as string,
    blockNumber: receipt.blockNumber as number,
    contractAddress: env.REVIEW_CONTRACT_ADDRESS!,
    gasUsed: receipt.gasUsed.toString(),
    explorerUrl: buildExplorerTxUrl(network, receipt.hash as string),
    network,
  };
}

// Price the tx from live network fee data with a 25% buffer.
//
// A previous version hard-capped maxFeePerGas at 30 gwei to conserve faucet
// POL. Amoy basefee now spikes well above that (100+ gwei), and a maxFeePerGas
// below basefee makes the node reject the tx — surfacing as the cryptic
// "missing revert data (action=estimateGas)" error. Always quote at/above
// basefee. MAX_FEE_GWEI is a safety ceiling, not a target.
const MAX_FEE_GWEI = 250n;

interface GasOverrides {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gasLimit?: bigint;
}

async function buildGasOverrides(gasLimit?: bigint): Promise<GasOverrides> {
  const fee = await getProvider().getFeeData();
  const tip = fee.maxPriorityFeePerGas ?? ethers.parseUnits('25', 'gwei');
  const base = fee.maxFeePerGas ?? ethers.parseUnits('50', 'gwei');
  let maxFee = (base * 125n) / 100n; // +25% headroom for basefee drift
  const ceiling = ethers.parseUnits(MAX_FEE_GWEI.toString(), 'gwei');
  if (maxFee > ceiling) maxFee = ceiling;
  return gasLimit
    ? { maxFeePerGas: maxFee, maxPriorityFeePerGas: tip, gasLimit }
    : { maxFeePerGas: maxFee, maxPriorityFeePerGas: tip };
}

// Surface "wallet is empty" as a clear message instead of the cryptic
// estimateGas/insufficient-funds error ethers throws deep in the send path.
async function assertSignerFunded(overrides: GasOverrides): Promise<void> {
  if (!overrides.gasLimit) return;
  const signer = getSigner();
  const balance = await getProvider().getBalance(signer.address);
  const worstCost = overrides.gasLimit * overrides.maxFeePerGas;
  if (balance < worstCost) {
    throw new Error(
      `Insufficient POL: signer ${signer.address} holds ${ethers.formatEther(
        balance
      )} but anchoring needs ~${ethers.formatEther(
        worstCost
      )}. Fund the wallet from an Amoy faucet.`
    );
  }
}

// ─── Write: Batch anchor ───

export async function batchAnchorReviewsOnChain(
  inputs: AnchorInput[]
): Promise<AnchorResult> {
  if (!isConfigured()) throw new Error('Blockchain not configured');
  if (inputs.length === 0) throw new Error('Empty batch');
  if (inputs.length > 100) throw new Error('Batch too large (max 100)');

  const contract = getWriteContract();
  const network = await getNetworkInfo();

  const reviewIdHashes: string[] = [];
  const contentHashes: string[] = [];
  const ipfsCidHashes: string[] = [];
  const productIdHashes: string[] = [];
  const orderIdHashes: string[] = [];
  const reviewerHashes: string[] = [];

  for (const i of inputs) {
    reviewIdHashes.push(idHash(i.reviewId));
    contentHashes.push(toBytes32(i.contentHash));
    ipfsCidHashes.push(idHash(i.ipfsCid));
    productIdHashes.push(idHash(i.productId));
    orderIdHashes.push(idHash(i.orderId));
    reviewerHashes.push(idHash(i.userId));
  }

  const overrides = await buildGasOverrides();
  const receipt = await withRetry(async () => {
    try {
      const tx = await contract.batchAnchorReviews(
        reviewIdHashes,
        contentHashes,
        ipfsCidHashes,
        productIdHashes,
        orderIdHashes,
        reviewerHashes,
        overrides
      );
      return await tx.wait();
    } catch (err) {
      const decoded = decodeContractError(err);
      if (decoded) throw new Error(decoded);
      throw err;
    }
  });

  if (!receipt) throw new Error('Batch transaction receipt unavailable');

  return {
    txHash: receipt.hash as string,
    blockNumber: receipt.blockNumber as number,
    contractAddress: env.REVIEW_CONTRACT_ADDRESS!,
    gasUsed: receipt.gasUsed.toString(),
    explorerUrl: buildExplorerTxUrl(network, receipt.hash as string),
    network,
  };
}

// ─── Read: Verify Review On-Chain ───

export async function verifyReviewOnChain(
  reviewId: string,
  contentHash: string
): Promise<{ exists: boolean; verified: boolean; proof: OnChainProof | null }> {
  if (env.BLOCKCHAIN_DEMO_MODE) {
    return {
      exists: true,
      verified: true,
      proof: simulateProof(reviewId, contentHash),
    };
  }
  if (!isConfigured()) {
    return { exists: false, verified: false, proof: null };
  }

  try {
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
  } catch (e) {
    // RPC unreachable, contract not deployed at configured address, or call reverted.
    // Treat as "not anchored" so /verify page renders cleanly instead of 500.
    return { exists: false, verified: false, proof: null };
  }
}

// ─── Read: locate an existing anchor tx by reviewId ───
//
// Used to backfill blockchainTxHash when the contract reports the proof
// already exists (DuplicateProof) but our DB never recorded the tx — e.g.
// the tx mined but the response handler crashed.

export async function findAnchorTxForReview(
  reviewId: string
): Promise<{ txHash: string; blockNumber: number; network: NetworkInfo } | null> {
  if (!isConfigured()) return null;
  try {
    const contract = getReadContract();
    const provider = getProvider();
    const network = await getNetworkInfo();
    const reviewIdHash = idHash(reviewId);
    const filter = contract.filters.ReviewAnchored(reviewIdHash);
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 100000);
    const events = await contract.queryFilter(filter, fromBlock, currentBlock);
    if (events.length === 0) return null;
    const log = events[events.length - 1] as ethers.EventLog;
    return { txHash: log.transactionHash, blockNumber: log.blockNumber, network };
  } catch {
    return null;
  }
}

// ─── Read: Quick Check ───

export async function hasProofOnChain(reviewId: string): Promise<boolean> {
  if (!isConfigured()) return false;
  const contract = getReadContract();
  return contract.hasProof(idHash(reviewId)) as Promise<boolean>;
}

// ─── Read: Recent on-chain events ───

export interface OnChainEvent {
  txHash: string;
  blockNumber: number;
  reviewIdHash: string;
  productIdHash: string;
  reviewerHash: string;
  contentHash: string;
  ipfsCidHash: string;
  orderIdHash: string;
  timestamp: number;
  explorerUrl: string;
}

export async function getRecentAnchoredEvents(limit = 25, blockLookback = 5000): Promise<OnChainEvent[]> {
  if (!isConfigured()) return [];
  const contract = getReadContract();
  const provider = getProvider();
  const network = await getNetworkInfo();
  const currentBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(0, currentBlock - blockLookback);

  const filter = contract.filters.ReviewAnchored();
  const events = await contract.queryFilter(filter, fromBlock, currentBlock);
  const slice = events.slice(-limit).reverse();

  return slice.map((ev) => {
    const log = ev as ethers.EventLog;
    const args = log.args;
    return {
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      reviewIdHash: args[0] as string,
      productIdHash: args[1] as string,
      reviewerHash: args[2] as string,
      contentHash: args[3] as string,
      ipfsCidHash: args[4] as string,
      orderIdHash: args[5] as string,
      timestamp: Number(args[6]),
      explorerUrl: buildExplorerTxUrl(network, log.transactionHash),
    };
  });
}

// ─── Status Check ───

export function isBlockchainConfigured(): boolean {
  return env.BLOCKCHAIN_DEMO_MODE || isConfigured();
}

// ─── Demo mode ───
//
// When BLOCKCHAIN_DEMO_MODE=true the app produces a deterministic, simulated
// anchor instead of broadcasting a real tx. No RPC, no signer, no POL. The
// fake proof is derived from the reviewId so the same review always yields the
// same tx hash / proof, and verifyReviewOnChain can re-derive it for /verify.

export function isDemoMode(): boolean {
  return env.BLOCKCHAIN_DEMO_MODE;
}

const DEMO_CONTRACT_ADDRESS = '0xDED0DED0DED0DED0DED0DED0DED0DED0DED0DED0';
const DEMO_NETWORK: NetworkInfo = {
  chainId: 80002,
  name: 'Polygon Amoy (Demo)',
  explorerUrl: 'https://amoy.polygonscan.com',
  rpcUrl: 'demo',
};

export function simulateAnchor(input: AnchorInput): AnchorResult {
  // txHash: keccak256("tx:" + reviewId) → stable 32-byte hex.
  const txHash = ethers.id(`tx:${input.reviewId}`);
  // blockNumber: stable pseudo-value in a plausible Amoy range.
  const blockNumber =
    Number(BigInt(ethers.id(`blk:${input.reviewId}`)) % 5_000_000n) + 10_000_000;
  return {
    txHash,
    blockNumber,
    contractAddress: DEMO_CONTRACT_ADDRESS,
    gasUsed: '0',
    explorerUrl: buildExplorerTxUrl(DEMO_NETWORK, txHash),
    network: DEMO_NETWORK,
  };
}

function simulateProof(reviewId: string, contentHash: string): OnChainProof {
  return {
    contentHash: toBytes32(contentHash),
    ipfsCidHash: idHash(`ipfs:${reviewId}`),
    productIdHash: idHash(`product:${reviewId}`),
    orderIdHash: idHash(`order:${reviewId}`),
    reviewerHash: idHash(`reviewer:${reviewId}`),
    // Deterministic timestamp: a fixed base minus a per-review offset (< 30d)
    // so the anchored time is stable across reloads.
    timestamp:
      1_716_000_000 -
      Number(BigInt(ethers.id(`ts:${reviewId}`)) % 2_592_000n),
    exists: true,
  };
}

export async function getBlockchainStatus(): Promise<BlockchainStatus> {
  if (!isConfigured()) {
    return {
      configured: false,
      connected: false,
      network: null,
      contractAddress: null,
      proofCount: 0,
      paused: false,
      signerAddress: null,
      signerBalance: null,
    };
  }

  try {
    const network = await getNetworkInfo();
    const contract = getReadContract();
    const signer = getSigner();

    const [proofCountBn, paused, balance] = await Promise.all([
      contract.proofCount() as Promise<bigint>,
      contract.paused() as Promise<boolean>,
      getProvider().getBalance(signer.address),
    ]);

    return {
      configured: true,
      connected: true,
      network,
      contractAddress: env.REVIEW_CONTRACT_ADDRESS!,
      proofCount: Number(proofCountBn),
      paused,
      signerAddress: signer.address,
      signerBalance: ethers.formatEther(balance),
    };
  } catch (err) {
    logger.error('getBlockchainStatus failed', err);
    return {
      configured: true,
      connected: false,
      network: null,
      contractAddress: env.REVIEW_CONTRACT_ADDRESS!,
      proofCount: 0,
      paused: false,
      signerAddress: null,
      signerBalance: null,
    };
  }
}
