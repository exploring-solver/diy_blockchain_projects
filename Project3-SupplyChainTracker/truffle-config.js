require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

const { MNEMONIC, INFURA_API_KEY } = process.env;

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(MNEMONIC, `https://sepolia.infura.io/v3/${INFURA_API_KEY}`),
      network_id: 11155111, // Sepolia's network id
      gas: 1000000,         // Lower gas limit to reduce deployment cost
      gasPrice: 500000000, // 5 Gwei, lower than before
      networkCheckTimeout: 1000000 // Increase the timeout to a higher value (1,000,000 ms)
    }    
  },

  mocha: {
    timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.8.21", // Specify the exact version
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  db: {
    enabled: false
  }
};
