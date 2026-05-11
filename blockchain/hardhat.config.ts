import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const localhostUrl = process.env.LOCALHOST_RPC_URL || "http://127.0.0.1:8545";
const ganacheUrl = process.env.GANACHE_RPC_URL || localhostUrl;
const ganacheChainId = Number(process.env.GANACHE_CHAIN_ID || 1337);
const polygonAmoyUrl = process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/";
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: localhostUrl,
    },
    ganache: {
      url: ganacheUrl,
      chainId: ganacheChainId,
    },
    amoy: {
      url: polygonAmoyUrl,
      chainId: 80002,
      accounts: [deployerPrivateKey],
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://www.oklink.com/api/v5/explorer/address/contract/verify/async",
          browserURL: "https://www.oklink.com/amoy",
        },
      },
    ],
  },
};

export default config;
