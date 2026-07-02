import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
const POLYGON_AMOY_RPC = process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";
const MAINNET_RPC = process.env.MAINNET_RPC_URL || "https://eth.llamarpc.com";
const POLYGON_MAINNET_RPC = process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-rpc.com";
const BASE_MAINNET_RPC = process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org";
const BNB_MAINNET_RPC = process.env.BNB_MAINNET_RPC_URL || "https://bsc-dataseed.binance.org";
const AVALANCHE_MAINNET_RPC = process.env.AVALANCHE_MAINNET_RPC_URL || "https://api.avax.network/ext/bc/C/rpc";
const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    polygonAmoy: {
      url: POLYGON_AMOY_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 80002,
    },
    // Mainnets — not deployed to yet. Wired here so the deploy scripts have a
    // target once you're ready to run them; running them is a deliberate,
    // separate step (costs real gas) and is not done automatically.
    mainnet: {
      url: MAINNET_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 1,
    },
    polygonMainnet: {
      url: POLYGON_MAINNET_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 137,
    },
    baseMainnet: {
      url: BASE_MAINNET_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 8453,
    },
    bnbMainnet: {
      url: BNB_MAINNET_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 56,
    },
    avalancheMainnet: {
      url: AVALANCHE_MAINNET_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 43114,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
