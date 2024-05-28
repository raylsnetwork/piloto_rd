import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    },
  },
  networks: {
    rayls: {
      url: process.env.RPCURL ?? "",
      accounts: [
        process.env.PRIVATEKEY_DEPLOYER ?? "",
        process.env.PRIVATEKEY_CLIENT ?? ""
      ]
    }
  },
  mocha: {
    timeout: 9000000
  }
};

export default config;
