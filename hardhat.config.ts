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
    },
    raylsB: {
      url: "http://parfin-privacy-ledger-04.api.blockchain-sandbox.parfin.aws",
      accounts: [
        "c39fc3329b0c349ffdd9874bf8f9a2f5bb51f89ee6a4175945e019c18dc29019",
        "223fbc93bb95d920ea5a13a2453cdb2f7de700a94df858c8ed843ad08caedb5a"
      ]
    }
  },
  mocha: {
    timeout: 9000000
  }
};

export default config;
