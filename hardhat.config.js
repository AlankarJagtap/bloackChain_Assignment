import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
  },
  paths: {
    artifacts: "./src/artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test"
  },
  mocha: {
    timeout: 40000
  }
};
