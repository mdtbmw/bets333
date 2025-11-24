
const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  const platformFeeBps = process.env.PLATFORM_FEE_BPS;
  const ownerAddress = (await hre.ethers.getSigners())[0].address;

  if (!treasuryAddress || !platformFeeBps) {
    console.error("\n❌ ERROR: TREASURY_ADDRESS and PLATFORM_FEE_BPS must be set in your .env file.");
    console.error("Please ensure your .env file is correctly configured before deploying.\n");
    process.exit(1);
  }

  console.log("\n====================================================================");
  console.log("   🚀  Starting Full Contract Suite Deployment...  🚀");
  console.log("====================================================================");
  console.log(`\n   Deployer Account: ${ownerAddress}`);

  // --- Deploy IntuitionBettingOracle ---
  console.log("\n   Deploying IntuitionBettingOracle...");
  console.log(`     - Treasury: ${treasuryAddress}`);
  console.log(`     - Platform Fee: ${platformFeeBps} BPS`);

  const IntuitionBettingOracle = await hre.ethers.getContractFactory("IntuitionBettingOracle");
  const bettingContract = await IntuitionBettingOracle.deploy(ownerAddress, treasuryAddress, platformFeeBps);
  await bettingContract.waitForDeployment();
  const bettingContractAddress = await bettingContract.getAddress();
  
  console.log(`   ✅  IntuitionBettingOracle deployed to: ${bettingContractAddress}`);

  // --- Deploy UserProfileRegistry ---
  console.log("\n   Deploying UserProfileRegistry...");
  
  const UserProfileRegistry = await hre.ethers.getContractFactory("UserProfileRegistry");
  const profileContract = await UserProfileRegistry.deploy(ownerAddress);
  await profileContract.waitForDeployment();
  const profileContractAddress = await profileContract.getAddress();
  
  console.log(`   ✅  UserProfileRegistry deployed to: ${profileContractAddress}`);


  console.log(`\n====================================================================`);
  console.log(`   🎉  All Contracts Deployed Successfully! 🎉`);
  console.log(`====================================================================\n`);
  console.log("Please copy the following lines and paste them into your .env file:\n");
  // The final lines of output MUST be the addresses for scripts to capture them.
  console.log(`NEXT_PUBLIC_INTUITION_BETTING_ADDRESS=${bettingContractAddress}`);
  console.log(`NEXT_PUBLIC_USER_PROFILE_REGISTRY_ADDRESS=${profileContractAddress}`);
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:", error);
  process.exitCode = 1;
});

    