import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // 1. Deploy RWATokenFactory
  const Factory = await ethers.getContractFactory("RWATokenFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log("RWATokenFactory deployed to:", factoryAddr);

  // 2. Deploy ComplianceRegistry
  const Compliance = await ethers.getContractFactory("ComplianceRegistry");
  const compliance = await Compliance.deploy();
  await compliance.waitForDeployment();
  const complianceAddr = await compliance.getAddress();
  console.log("ComplianceRegistry deployed to:", complianceAddr);

  // 3. Deploy TreasuryVault (threshold: 1 ETH, 1 approval required)
  const Treasury = await ethers.getContractFactory("TreasuryVault");
  const treasury = await Treasury.deploy(ethers.parseEther("1"), 1);
  await treasury.waitForDeployment();
  const treasuryAddr = await treasury.getAddress();
  console.log("TreasuryVault deployed to:", treasuryAddr);

  // 4. Deploy YieldDistributor
  const Yield = await ethers.getContractFactory("YieldDistributor");
  const yieldDist = await Yield.deploy();
  await yieldDist.waitForDeployment();
  const yieldAddr = await yieldDist.getAddress();
  console.log("YieldDistributor deployed to:", yieldAddr);

  console.log("\n── Deployment Summary ──");
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddr}`);
  console.log(`NEXT_PUBLIC_COMPLIANCE_ADDRESS=${complianceAddr}`);
  console.log(`NEXT_PUBLIC_TREASURY_ADDRESS=${treasuryAddr}`);
  console.log(`NEXT_PUBLIC_YIELD_ADDRESS=${yieldAddr}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
