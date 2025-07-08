import { ethers } from "hardhat";
import { getPLInformation, getBalanceCBDCSync, getBalanceRTSync } from "../utils/utils";
import IendpointContractABI from "../abi/EndpointV1.json";

async function getBalances() {
    const {
        endpointContractAddr,
        cbdcResourceId,
        strResourceId,
        rtResourceId
    } = await getPLInformation();

    const [reservesSigner, clientSigner] = await ethers.getSigners();

    const reservesAccAddr = reservesSigner.address;
    const clientAccAddr = clientSigner.address;

    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        reservesSigner
    );

    console.log("[DEBUG] Checking RESERVES wallet balances...");
    const balanceCbdcReserves =
      (await getBalanceCBDCSync(
        endpointContract,
        cbdcResourceId,
        reservesSigner,
        reservesAccAddr
      )) ?? BigInt(0);
    console.log("[DEBUG] CBDC reserves account balance:", balanceCbdcReserves);
    
    const balanceRtReserves =
      (await getBalanceRTSync(
        endpointContract,
        rtResourceId,
        reservesSigner,
        reservesAccAddr
      )) ?? BigInt(0);
    console.log("[DEBUG] RealTokenizado reserves account balance:", balanceRtReserves);

    console.log("");
    console.log("[DEBUG] Checking CLIENT wallet balances...");
    const balanceCbdcClient =
      (await getBalanceCBDCSync(
        endpointContract,
        cbdcResourceId,
        clientSigner,
        clientAccAddr
      )) ?? BigInt(0);
    console.log("[DEBUG] CBDC client account balance:", balanceCbdcClient);
    
    const balanceRtClient =
      (await getBalanceRTSync(
        endpointContract,
        rtResourceId,
        clientSigner,
        clientAccAddr
      )) ?? BigInt(0);
    console.log("[DEBUG] RealTokenizado client account balance:", balanceRtClient);
    console.log("");

    const strAddr = await endpointContract.resourceIdToContractAddress(
      strResourceId
    );

    const cbdcAddr = await endpointContract.resourceIdToContractAddress(
      cbdcResourceId
    );

    const realTokenizadoAddr = await endpointContract.resourceIdToContractAddress(
      rtResourceId
    );

    console.log("[DEBUG] All Contracts Addresses:");
    console.log("[DEBUG] STR:", strAddr);
    console.log("[DEBUG] CDBC:", cbdcAddr);
    console.log("[DEBUG] RealTokenizado:", realTokenizadoAddr);
}

getBalances()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

