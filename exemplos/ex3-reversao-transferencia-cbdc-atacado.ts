import { ethers } from "hardhat";
import { 
    getBalanceCBDCSync, 
    getPLInformation, 
    TimeoutExecution 
} from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import CbdcABI from "../abi/CBDC.json";

async function example3() {
    const { 
        endpointContractAddr,
        cbdcResourceId,
        wdResourceId
    } = await getPLInformation();

    const [deployerSigner] = await ethers.getSigners();

    const chainIdDestination = process.env.DEST_CHAINID ?? 0;
    const randomWallet = ethers.Wallet.createRandom();
    
    const transferAmount = ethers.parseUnits("10", 2);

    const endpointContractA = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        deployerSigner
    );
    
    const walletDefault = await endpointContractA.resourceIdToContractAddress(
        wdResourceId
    );
    const cbdcAddress = await endpointContractA.resourceIdToContractAddress(
        cbdcResourceId
    );

    const cbdcContract = await ethers.getContractAt(
        CbdcABI, 
        cbdcAddress, 
        deployerSigner
    );

    console.log("[DEBUG] Checking balance at ORIGIN before...");
    const balanceBefore = await getBalanceCBDCSync(
        endpointContractA, 
        cbdcResourceId, 
        deployerSigner, 
        walletDefault
    );
    console.log("[DEBUG] balanceBefore:", balanceBefore);


    console.log(`[DEBUG] Invoking teleportAtomic to ${randomWallet.address}`);
    const txAtomic = await cbdcContract.teleportAtomic(
        randomWallet.address, 
        transferAmount, 
        chainIdDestination
    );
    await txAtomic.wait();

    console.log("[DEBUG] Checking balance at ORIGIN just after teleporting...");
    const balanceInBetween = await getBalanceCBDCSync(
        endpointContractA, 
        cbdcResourceId, 
        deployerSigner, 
        walletDefault
    );
    console.log("[DEBUG] balanceInBetween:", balanceInBetween);

    console.log("[DEBUG] Entering reversal balance check...");
    console.time("[DEBUG] Waiting CBDC balance to be updated:");
    const balanceAfter = await TimeoutExecution(async (retry) => {

        const balanceCBDC = await getBalanceCBDCSync(
            endpointContractA, 
            cbdcResourceId, 
            deployerSigner, 
            walletDefault
        );
        if (balanceCBDC != balanceInBetween) {
            return [true, balanceCBDC];
        } else return [false, BigInt(0)];
    });
    console.timeEnd("[DEBUG] Waiting CBDC balance to be updated:");
    console.log("[DEBUG] balanceAfter:", balanceAfter);
}

example3()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

