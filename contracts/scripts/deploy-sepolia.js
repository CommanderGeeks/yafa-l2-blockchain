const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Yafa L2 to Sepolia...");
  console.log("Network:", hre.network.name);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (hre.ethers.formatEther(balance) < 0.1) {
    throw new Error("❌ Insufficient ETH balance. Need at least 0.1 ETH for deployment.");
  }

  // Treasury will be the deployer for now
  const treasuryAddress = deployer.address;
  const sequencerAddress = deployer.address; // Same for Phase 1

  console.log("🏦 Treasury address:", treasuryAddress);
  console.log("⚡ Sequencer address:", sequencerAddress);

  // Deploy enhanced bridge contract
  console.log("\n🌉 Deploying YafaBridgeProduction...");
  const YafaBridge = await hre.ethers.getContractFactory("YafaBridgeProduction");
  const yafaBridge = await YafaBridge.deploy(treasuryAddress, sequencerAddress);
  
  console.log("⏳ Waiting for deployment confirmation...");
  await yafaBridge.waitForDeployment();
  const bridgeAddress = await yafaBridge.getAddress();
  console.log("✅ YafaBridgeProduction deployed to:", bridgeAddress);

  // Deploy DEX (using existing contract)
  console.log("\n💱 Deploying YafaDex...");
  const YafaDex = await hre.ethers.getContractFactory("YafaDex");
  const yafaDex = await YafaDex.deploy();
  
  await yafaDex.waitForDeployment();
  const dexAddress = await yafaDex.getAddress();
  console.log("✅ YafaDex deployed to:", dexAddress);

  // Wait a bit for Etherscan indexing
  console.log("\n⏳ Waiting for Etherscan indexing...");
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Verify contracts on Etherscan
  if (hre.network.name === "sepolia") {
    try {
      console.log("\n🔍 Verifying contracts on Etherscan...");
      
      await hre.run("verify:verify", {
        address: bridgeAddress,
        constructorArguments: [treasuryAddress, sequencerAddress],
      });
      console.log("✅ Bridge contract verified");

      await hre.run("verify:verify", {
        address: dexAddress,
        constructorArguments: [],
      });
      console.log("✅ DEX contract verified");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }

  // Display summary
  console.log("\n🎉 Sepolia Deployment Summary:");
  console.log("================================");
  console.log("🌉 YafaBridge:", bridgeAddress);
  console.log("💱 YafaDex:", dexAddress);
  console.log("🏦 Treasury:", treasuryAddress);
  console.log("⚡ Sequencer:", sequencerAddress);
  console.log("🔗 Network: Sepolia Testnet");
  console.log("⛽ Bridge Fee:", "0.001 ETH");

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    contracts: {
      YafaBridge: bridgeAddress,
      YafaDex: dexAddress,
      Treasury: treasuryAddress,
      Sequencer: sequencerAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    etherscanUrls: {
      bridge: `https://sepolia.etherscan.io/address/${bridgeAddress}`,
      dex: `https://sepolia.etherscan.io/address/${dexAddress}`
    }
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployments-sepolia.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n💾 Deployment info saved to deployments-sepolia.json");
  console.log("\n🔗 View on Etherscan:");
  console.log("Bridge:", deploymentInfo.etherscanUrls.bridge);
  console.log("DEX:", deploymentInfo.etherscanUrls.dex);

  console.log("\n🚀 Ready for L2 sequencer configuration!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });