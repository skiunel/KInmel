import crypto from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { env } from '../config/env';

// ─── Types ───

export interface ReviewPayload {
  rating: number;
  title: string;
  content: string;
  productId: string;
  orderId: string;
  userId: string;
  timestamp: string;
}

export interface IPFSResult {
  stored: boolean;
  ipfsHash: string | null;
  contentHash: string;
  gatewayUrl: string | null;
  provider: 'pinata' | 'mock' | 'unavailable';
  reason?: string;
}

export interface StoredReviewDocument extends ReviewPayload {
  contentHash: string;
  schema: 'kinmel-review-v1';
}

const TEST_MOCK_PREFIX = 'Qm_test_';
const LOCAL_MOCK_PREFIX = 'Qm_local_';
const LOCAL_MOCK_DIR = path.join(os.tmpdir(), 'kinmel-mock-ipfs');

// ─── Content Hash ───
// SHA-256 of the canonical JSON — used to verify integrity later

export function hashContent(payload: ReviewPayload): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

export function buildStoredReviewDocument(
  payload: ReviewPayload
): StoredReviewDocument {
  return {
    ...payload,
    contentHash: hashContent(payload),
    schema: 'kinmel-review-v1',
  };
}

function isTestMockHash(ipfsHash: string): boolean {
  return ipfsHash.startsWith(TEST_MOCK_PREFIX);
}

function isLocalMockHash(ipfsHash: string): boolean {
  return ipfsHash.startsWith(LOCAL_MOCK_PREFIX);
}

function getLocalMockPath(ipfsHash: string): string {
  return path.join(LOCAL_MOCK_DIR, `${ipfsHash}.json`);
}

export async function storeLocalMockReviewDocument(
  document: StoredReviewDocument
): Promise<string> {
  const ipfsHash = `${LOCAL_MOCK_PREFIX}${document.contentHash}`;
  await fs.mkdir(LOCAL_MOCK_DIR, { recursive: true });
  await fs.writeFile(
    getLocalMockPath(ipfsHash),
    JSON.stringify(document, null, 2),
    'utf8'
  );
  return ipfsHash;
}

export async function readLocalMockReviewDocument(
  ipfsHash: string
): Promise<StoredReviewDocument | null> {
  if (!isLocalMockHash(ipfsHash)) {
    return null;
  }

  try {
    const raw = await fs.readFile(getLocalMockPath(ipfsHash), 'utf8');
    const data = JSON.parse(raw) as Record<string, unknown>;
    return isStoredReviewDocument(data) ? data : null;
  } catch {
    return null;
  }
}

export function extractPayloadFromStoredDocument(
  document: StoredReviewDocument
): ReviewPayload {
  return {
    rating: document.rating,
    title: document.title,
    content: document.content,
    productId: document.productId,
    orderId: document.orderId,
    userId: document.userId,
    timestamp: document.timestamp,
  };
}

export function isStoredReviewDocument(
  value: unknown
): value is StoredReviewDocument {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.rating === 'number' &&
    typeof candidate.title === 'string' &&
    typeof candidate.content === 'string' &&
    typeof candidate.productId === 'string' &&
    typeof candidate.orderId === 'string' &&
    typeof candidate.userId === 'string' &&
    typeof candidate.timestamp === 'string' &&
    typeof candidate.contentHash === 'string' &&
    candidate.schema === 'kinmel-review-v1'
  );
}

// ─── Pin to IPFS via Pinata ───

export async function pinReviewToIPFS(
  payload: ReviewPayload
): Promise<IPFSResult> {
  const document = buildStoredReviewDocument(payload);
  const contentHash = document.contentHash;

  const pinataApiKey = env.PINATA_API_KEY;
  const pinataSecretKey = env.PINATA_SECRET_KEY;
  const pinataJwt = env.PINATA_JWT;
  const gateway = env.PINATA_GATEWAY
    ? (env.PINATA_GATEWAY.replace(/\/+$/, '').endsWith('/ipfs')
        ? env.PINATA_GATEWAY.replace(/\/+$/, '')
        : `${env.PINATA_GATEWAY.replace(/\/+$/, '')}/ipfs`)
    : 'https://gateway.pinata.cloud/ipfs';

  if (!pinataJwt && (!pinataApiKey || !pinataSecretKey)) {
    if (env.NODE_ENV === 'test') {
      const stubHash = `${TEST_MOCK_PREFIX}${contentHash.slice(0, 32)}`;
      return {
        stored: true,
        ipfsHash: stubHash,
        contentHash,
        gatewayUrl: `${gateway}/${stubHash}`,
        provider: 'mock',
      };
    }

    if (env.NODE_ENV === 'development') {
      const localHash = await storeLocalMockReviewDocument(document);
      return {
        stored: true,
        ipfsHash: localHash,
        contentHash,
        gatewayUrl: buildGatewayUrl(localHash),
        provider: 'mock',
        reason:
          'Stored in Kinmel local development proof storage. Add Pinata credentials for a public IPFS record.',
      };
    }

    return {
      stored: false,
      ipfsHash: null,
      contentHash,
      gatewayUrl: null,
      provider: 'unavailable',
      reason:
        'IPFS storage is unavailable because Pinata credentials are not configured on the server.',
    };
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (pinataJwt) {
    headers.Authorization = `Bearer ${pinataJwt}`;
  } else {
    headers.pinata_api_key = pinataApiKey!;
    headers.pinata_secret_api_key = pinataSecretKey!;
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      pinataContent: document,
      pinataMetadata: {
        name: `kinmel-review-${payload.productId}-${Date.now()}`,
        keyvalues: {
          type: 'review',
          productId: payload.productId,
          userId: payload.userId,
          contentHash,
        },
      },
      pinataOptions: {
        cidVersion: 1,
      },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `Pinata request failed with status ${response.status}${errorBody ? `: ${errorBody}` : ''}`
    );
  }

  const result = (await response.json()) as { IpfsHash?: string };

  if (!result.IpfsHash) {
    throw new Error('Pinata did not return an IPFS hash');
  }

  return {
    stored: true,
    ipfsHash: result.IpfsHash,
    contentHash,
    gatewayUrl: `${gateway}/${result.IpfsHash}`,
    provider: 'pinata',
  };
}

// Normalize gateway: ensure /ipfs path segment; strip trailing slash.
function normalizeGateway(raw: string): string {
  const trimmed = raw.replace(/\/+$/, '');
  return trimmed.endsWith('/ipfs') ? trimmed : `${trimmed}/ipfs`;
}

export function buildGatewayUrl(ipfsHash: string): string {
  if (isLocalMockHash(ipfsHash)) {
    return `http://localhost:${env.PORT}/api/v1/reviews/ipfs/${encodeURIComponent(ipfsHash)}`;
  }

  const gateway = env.PINATA_GATEWAY
    ? normalizeGateway(env.PINATA_GATEWAY)
    : 'https://gateway.pinata.cloud/ipfs';
  return `${gateway}/${ipfsHash}`;
}

// Fallback gateways tried in order if primary fails.
function gatewayCandidates(ipfsHash: string): string[] {
  const urls: string[] = [];
  if (env.PINATA_GATEWAY) {
    urls.push(`${normalizeGateway(env.PINATA_GATEWAY)}/${ipfsHash}`);
  }
  urls.push(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
  urls.push(`https://ipfs.io/ipfs/${ipfsHash}`);
  urls.push(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`);
  return Array.from(new Set(urls));
}

// ─── Fetch from IPFS (for verification) ───

export async function fetchFromIPFS(
  ipfsHash: string
): Promise<StoredReviewDocument | null> {
  if (isTestMockHash(ipfsHash)) {
    return null;
  }

  if (isLocalMockHash(ipfsHash)) {
    return readLocalMockReviewDocument(ipfsHash);
  }

  for (const url of gatewayCandidates(ipfsHash)) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) continue;

      const data = (await response.json()) as Record<string, unknown>;
      if (isStoredReviewDocument(data)) return data;
    } catch {
      // try next gateway
    }
  }

  return null;
}

// ─── Verify Content Integrity ───
// Re-hash the review payload and compare to stored contentHash

export function verifyContentIntegrity(
  payload: ReviewPayload,
  storedHash: string
): boolean {
  return hashContent(payload) === storedHash;
}
