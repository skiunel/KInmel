import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const localhostUrl = process.env.LOCALHOST_RPC_URL || "http://127.0.0.1:8545";
const ganacheUrl = process.env.GANACHE_RPC_URL || localhostUrl;
const ganacheChainId = Number(process.env.GANACHE_CHAIN_ID || 1337);

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
  },
};

export default config;
