import { ethers } from "hardhat";
import { 
    getPLInformation, 
    getBalanceCBDCSync, 
    TimeoutExecution 
} from "../utils/utils";

import IEndpointABI from "../abi/IEndpoint.json";
import StrABI from "../abi/STR.json";

async function example1() {
    const { 
        endpointContractAddr, 
        cbdcResourceId
    } = await getPLInformation();

    const [deployerSigner] = await ethers.getSigners();
    
    const amountRequested = ethers.parseUnits("3000", 2);

    const endpointContract = await ethers.getContractAt(
        IEndpointABI, 
        endpointContractAddr, 
        deployerSigner
    );
    const walletDefault = await endpointContract.resourceIdToContractAddress(
        ethers.id("WalletDefault")
    );

    console.log("[DEBUG] Checking balance before...");
    let balanceBefore = await getBalanceCBDCSync(
        endpointContract, 
        cbdcResourceId, 
        deployerSigner, 
        walletDefault
    ) ?? BigInt(0);
    console.log("[DEBUG] balanceBefore:", balanceBefore);

    const strAddress = await endpointContract.resourceIdToContractAddress(
        ethers.id("STR")
    );
    const strContract = await ethers.getContractAt(
        StrABI, 
        strAddress, 
        deployerSigner
    );
    
    console.log("[DEBUG] Invoking requestToMint...");
    const txRequestToMint = await strContract.requestToMint(amountRequested);
    await txRequestToMint.wait();

    const balanceAfter = await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting CBDC balance to be updated:", retry);
        const balanceCBDC = await getBalanceCBDCSync(
            endpointContract, 
            cbdcResourceId, 
            deployerSigner, 
            walletDefault
        );
        if (balanceCBDC != undefined && balanceCBDC != balanceBefore) {
            return [true, balanceCBDC];
        } else return [false, BigInt(0)];
    });
    console.log("[DEBUG] balanceAfter:", balanceAfter);
};

example1()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });