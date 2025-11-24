import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

// Ensure all necessary environment variables are set
const deployerPrivateKey = process.env.INTUITION_DEPLOYER_PRIVATE_KEY;
const intuitionRpcUrl = process.env.NEXT_PUBLIC_INTUITION_RPC;

if (!deployerPrivateKey || !intuitionRpcUrl) {
  console.warn("Warning: Missing environment variables for Hardhat configuration. Skipping network setup.");
}

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
  // Only configure the network if the required variables are present
  networks: (deployerPrivateKey && intuitionRpcUrl) ? {
    intuition: {
      url: intuitionRpcUrl,
      accounts: [deployerPrivateKey],
    },
  } : {},
};

export default config;
