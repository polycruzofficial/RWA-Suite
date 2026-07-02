import { ethers } from "hardhat";

// Deploys PlatformFeeManager to whichever network you run this against, e.g.:
//   npx hardhat run scripts/deploy-fee-manager.ts --network baseMainnet
//
// This is NOT run automatically — it costs real gas on mainnets. Run it
// yourself once you're ready, then copy the printed address into the
// matching NEXT_PUBLIC_FEE_MANAGER_ADDRESS_<CHAIN> env var.
async function main() {
  const [deployer] = await ethers.getSigners();

  const feeRecipient = process.env.PLATFORM_FEE_RECIPIENT || deployer.address;
  const deploymentFeeWei = BigInt(process.env.PLATFORM_DEPLOYMENT_FEE_WEI || "0");
  const buyFeeBps = BigInt(process.env.PLATFORM_BUY_FEE_BPS || "0");

  console.log("Deploying PlatformFeeManager with:", deployer.address);
  console.log("Fee recipient:", feeRecipient);
  console.log("Deployment fee (wei):", deploymentFeeWei.toString());
  console.log("Buy fee (bps):", buyFeeBps.toString());

  const FeeManager = await ethers.getContractFactory("PlatformFeeManager");
  const feeManager = await FeeManager.deploy(feeRecipient, deploymentFeeWei, buyFeeBps);
  await feeManager.waitForDeployment();
  const feeManagerAddr = await feeManager.getAddress();

  console.log("\nPlatformFeeManager deployed to:", feeManagerAddr);
  console.log("Set this in your .env as NEXT_PUBLIC_FEE_MANAGER_ADDRESS_<CHAIN>=" + feeManagerAddr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
