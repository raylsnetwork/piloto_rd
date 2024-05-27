import { ethers } from "hardhat";
import { getBalanceCBDCSync, getPLInformation } from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import CbdcABI from "../abi/CBDC.json";

async function example2() {
    const {
        endpointContractAddr,
        cbdcResourceId,
        wdResourceId
    } = await getPLInformation();

    const [deployerSigner] = await ethers.getSigners();

    const chainIdDestination = process.env.DEST_CHAINID ?? 0;
    const destinationWd = process.env.DEST_RESERVES_ACC ?? 0;
    
    const amountRequested = ethers.parseUnits("1000", 2);

    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        deployerSigner
    );

    const walletDefault = await endpointContract.resourceIdToContractAddress(
        wdResourceId
    );
    const cbdcContractAddr = await endpointContract.resourceIdToContractAddress(
        cbdcResourceId
    );

    const cbdcContract = await ethers.getContractAt(
        CbdcABI, 
        cbdcContractAddr, 
        deployerSigner
    );

    console.log("[DEBUG] Checking balance at ORIGIN before...");
    const balanceBefore = await getBalanceCBDCSync(
        endpointContract, 
        cbdcResourceId, 
        deployerSigner, 
        walletDefault
    ) ?? BigInt(0);
    console.log("[DEBUG] balanceBefore:", balanceBefore);

    console.log("[DEBUG] Invoking teleportAtomic...");
    const txAtomic = await cbdcContract.teleportAtomic(
        destinationWd, 
        amountRequested, 
        chainIdDestination
    );
    await txAtomic.wait();

    const balanceAfter = await getBalanceCBDCSync(
        endpointContract, 
        cbdcResourceId, 
        deployerSigner, 
        walletDefault
    ) ?? BigInt(0);
    console.log("[DEBUG] balanceAfter:", balanceAfter);
}

example2()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

