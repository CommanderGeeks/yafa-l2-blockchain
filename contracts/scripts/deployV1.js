const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Yafa L2 deployment...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Treasury will be the deployer for now
  const treasuryAddress = deployer.address;
  console.log("🏦 Treasury address:", treasuryAddress);

  // Deploy YafaBridge
  console.log("\n🌉 Deploying YafaBridge...");
  const YafaBridge = await hre.ethers.getContractFactory("YafaBridge");
  
  // Deploy with treasury and sequencer (using treasury as sequencer for Phase 1)
  const yafaBridge = await YafaBridge.deploy(treasuryAddress, treasuryAddress);
  
  // Wait for deployment to complete
  const bridgeReceipt = await yafaBridge.deploymentTransaction().wait();
  console.log("✅ YafaBridge deployed to:", await yafaBridge.getAddress());

  // Deploy YafaDex
  console.log("\n💱 Deploying YafaDex...");
  const YafaDex = await hre.ethers.getContractFactory("YafaDex");
  
  const yafaDex = await YafaDex.deploy();
  
  // Wait for deployment to complete
  const dexReceipt = await yafaDex.deploymentTransaction().wait();
  console.log("✅ YafaDex deployed to:", await yafaDex.getAddress());

  // Get final addresses
  const bridgeAddress = await yafaBridge.getAddress();
  const dexAddress = await yafaDex.getAddress();

  // Display summary
  console.log("\n🎉 Deployment Summary:");
  console.log("========================");
  console.log("🌉 YafaBridge:", bridgeAddress);
  console.log("💱 YafaDex:", dexAddress);
  console.log("🏦 Treasury:", treasuryAddress);
  console.log("⛽ Bridge Fee:", "0.001 ETH");
  console.log("📈 DEX Fee:", "0.3%");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    contracts: {
      YafaBridge: bridgeAddress,
      YafaDex: dexAddress,
      Treasury: treasuryAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    `deployments-${hre.network.name}.json`, 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\n💾 Deployment info saved to deployments-${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });