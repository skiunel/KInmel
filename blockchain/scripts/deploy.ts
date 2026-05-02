import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying ReviewProof on ${network.name} with account:`, deployer.address);

  const factory = await ethers.getContractFactory("ReviewProof");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("ReviewProof deployed to:", address);
  console.log(
    "\nAdd this to your server .env:\n" +
    `  REVIEW_CONTRACT_ADDRESS=${address}\n` +
    `  BLOCKCHAIN_RPC_URL=${network.config.url ?? "http://127.0.0.1:8545"}\n` +
    "  DEPLOYER_PRIVATE_KEY=<private key for the same funded deployer account>"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
