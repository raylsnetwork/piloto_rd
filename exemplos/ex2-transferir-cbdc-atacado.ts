import { ethers } from "hardhat";
import { 
    getBalanceCBDCSync, 
    getPLInformation,
    TimeoutExecution 
} from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import CbdcABI from "../abi/CBDC.json";
import { Log } from "ethers";

interface TypedEventLog extends Log {
    args: {
        _reqNonce: bigint;
    };
}

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
    const recipeTxAtomic = await txAtomic.wait();

    let prevBlockNumber = recipeTxAtomic?.blockNumber ?? 0;
    let teleportNonce = BigInt(0);
    const dispatchEvents = await cbdcContract.queryFilter(
        cbdcContract.filters.teleportAtmDispatched(),
        prevBlockNumber,
        prevBlockNumber
    ) as TypedEventLog[];
    if (dispatchEvents.length > 0) {
        teleportNonce = dispatchEvents[0].args._reqNonce;
    }
    console.log("[DEBUG] teleportNonce:", teleportNonce);
    console.time("Waiting teleportAtomic acknowledgement");
    const teleportAcknowledged = await TimeoutExecution(async (retry) => {
       
        const currentBlockNumber = await ethers.provider.getBlockNumber();
        const events = await cbdcContract.queryFilter(
            cbdcContract.filters.teleportAtmAcknowledged(),
            prevBlockNumber,
            currentBlockNumber
        ) as TypedEventLog[];
        prevBlockNumber = currentBlockNumber;
        if (events.length > 0 && events[0].args._reqNonce == teleportNonce) {
            return [true, events[0].args._reqNonce];
        } else return [false, BigInt(0)];
    });
    console.timeEnd("Waiting teleportAtomic acknowledgement");
    console.log("[DEBUG] teleportAcknowledged:", teleportAcknowledged);

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

