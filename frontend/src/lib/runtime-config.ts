export const GOOGLE_AUTH_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';

export const GOOGLE_AUTH_ENABLED = GOOGLE_AUTH_CLIENT_ID.length > 0;

// ─── Blockchain runtime config ───

export const POLYGON_AMOY_CHAIN_ID = 80002;
export const POLYGON_AMOY_CHAIN_ID_HEX = '0x13882';
export const POLYGON_AMOY_RPC_URL =
  process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL?.trim() || 'https://rpc-amoy.polygon.technology/';
export const POLYGON_AMOY_EXPLORER_URL = 'https://amoy.polygonscan.com';

export const runtimeConfig = {
  contractAddress: process.env.NEXT_PUBLIC_REVIEW_CONTRACT_ADDRESS?.trim() || '',
  chainId: POLYGON_AMOY_CHAIN_ID,
  chainIdHex: POLYGON_AMOY_CHAIN_ID_HEX,
  rpcUrl: POLYGON_AMOY_RPC_URL,
  explorerUrl: POLYGON_AMOY_EXPLORER_URL,
  networkName: 'Polygon Amoy',
};

export function buildExplorerTxUrl(txHash: string): string {
  return `${POLYGON_AMOY_EXPLORER_URL}/tx/${txHash}`;
}

export function buildExplorerAddressUrl(address: string): string {
  return `${POLYGON_AMOY_EXPLORER_URL}/address/${address}`;
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}
