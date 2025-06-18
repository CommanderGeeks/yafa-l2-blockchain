const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Yafa DEX contracts...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy WETH (Wrapped ETH) - only for testnets
  // For mainnet, use the existing WETH address
  let wethAddress;
  if (hre.network.name === "hardhat" || hre.network.name === "localhost" || hre.network.name === "sepolia") {
    const WETH = await hre.ethers.getContractFactory("WETH9");
    const weth = await WETH.deploy();
    await weth.deployed();
    wethAddress = weth.address;
    console.log("WETH deployed to:", wethAddress);
  } else {
    // Mainnet WETH addresses
    const WETH_ADDRESSES = {
      mainnet: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      polygon: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      arbitrum: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      base: "0x4200000000000000000000000000000000000006",
    };
    wethAddress = WETH_ADDRESSES[hre.network.name] || WETH_ADDRESSES.mainnet;
    console.log("Using existing WETH at:", wethAddress);
  }

  // Deploy Factory
  const Factory = await hre.ethers.getContractFactory("YafaFactory");
  const factory = await Factory.deploy(deployer.address);
  await factory.deployed();
  console.log("YafaFactory deployed to:", factory.address);

  // Deploy Router
  const Router = await hre.ethers.getContractFactory("YafaRouter");
  const router = await Router.deploy(factory.address, wethAddress);
  await router.deployed();
  console.log("YafaRouter deployed to:", router.address);

  // Deploy test tokens for development
  if (hre.network.name === "hardhat" || hre.network.name === "localhost" || hre.network.name === "sepolia") {
    const TestToken = await hre.ethers.getContractFactory("TestERC20");
    
    const tokenA = await TestToken.deploy("Test Token A", "TKA", hre.ethers.utils.parseEther("1000000"));
    await tokenA.deployed();
    console.log("Test Token A deployed to:", tokenA.address);

    const tokenB = await TestToken.deploy("Test Token B", "TKB", hre.ethers.utils.parseEther("1000000"));
    await tokenB.deployed();
    console.log("Test Token B deployed to:", tokenB.address);

    // Create initial liquidity pool
    console.log("\n📊 Creating initial liquidity pool...");
    
    // Approve router to spend tokens
    await tokenA.approve(router.address, hre.ethers.constants.MaxUint256);
    await tokenB.approve(router.address, hre.ethers.constants.MaxUint256);
    
    // Add liquidity
    const tx = await router.addLiquidity(
      tokenA.address,
      tokenB.address,
      hre.ethers.utils.parseEther("1000"),
      hre.ethers.utils.parseEther("1000"),
      0,
      0,
      deployer.address,
      Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from now
    );
    await tx.wait();
    
    const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
    console.log("Liquidity pool created at:", pairAddress);
  }

  // Save deployment addresses
  const deployment = {
    factory: factory.address,
    router: router.address,
    weth: wethAddress,
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  fs.writeFileSync(
    `deployments/${hre.network.name}.json`,
    JSON.stringify(deployment, null, 2)
  );

  console.log("\n✅ Deployment complete!");
  console.log("Deployment details saved to:", `deployments/${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });