import { ethers } from "hardhat";
import { 
    getBalanceCBDCSync, 
    getBalanceRTSync, 
    getPLInformation, 
    TimeoutExecution 
} from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import CbdcABI from "../abi/CBDC.json";
import RealTokenizadoABI from "../abi/RealTokenizado.json";
import { Log } from "ethers";
interface TypedEventLog extends Log {
    args: {
        _reqNonce: bigint;
    };
}

async function example4() {
    const { 
        endpointContractAddr,
        cbdcResourceId,
        wdResourceId,
        rtResourceId
    } = await getPLInformation();

    const [deployerSigner, clientSigner] = await ethers.getSigners();

    const chainIdDestination = process.env.DEST_CHAINID ?? 0;
    const destClientAcc = process.env.DEST_CLIENT_ACC ?? 0;

    const amountToMintAndSwap = ethers.parseUnits("10", 2);

    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        deployerSigner
    );

    const walletDefault = await endpointContract.resourceIdToContractAddress(
        wdResourceId
    );
    const realTokenizadoAddr = await endpointContract.resourceIdToContractAddress(
        rtResourceId
    );
    const cbdcContractAddr = await endpointContract.resourceIdToContractAddress(
        cbdcResourceId
    );

    const realTokenizadoContract = await ethers.getContractAt(
        RealTokenizadoABI, 
        realTokenizadoAddr, 
        deployerSigner
    );
    console.log("[DEBUG] Minting Real Tokenizado for the client at origin...");
    const txMint = await realTokenizadoContract.mint(clientSigner.address, amountToMintAndSwap);
    await txMint.wait();

    const cbdcContract = await ethers.getContractAt(
        CbdcABI, 
        cbdcContractAddr, 
        clientSigner
    ); 

    const balancRTBefore = await getBalanceRTSync(
        endpointContract, 
        rtResourceId, 
        clientSigner, 
        clientSigner.address
    ) ?? BigInt(0);
    console.log("[DEBUG] balancRTBefore:", balancRTBefore);

    const balanceCDBCBefore = await getBalanceCBDCSync(
        endpointContract, 
        cbdcResourceId, 
        deployerSigner, 
        walletDefault
    ) ?? BigInt(0);
    console.log("[DEBUG] balanceCDBCBefore:", balanceCDBCBefore);

    console.log("[DEBUG] Approving RealTokenizado amount for CBDC contract address...");
    const txApproveRT = await realTokenizadoContract
        .connect(clientSigner)
        .approve(
            cbdcContractAddr, 
            amountToMintAndSwap
        );
    await txApproveRT.wait();

    console.log(`[DEBUG] swap ...`);
    const txSwap = await cbdcContract.swap(
        chainIdDestination, 
        cbdcResourceId, 
        destClientAcc, 
        amountToMintAndSwap
    );
    await txSwap.wait();
    const recipeTxSwap = await txSwap.wait();

    let prevBlockNumber = recipeTxSwap?.blockNumber ?? 0;
    let swapNonce = BigInt(0);
    const dispatchEvents = await cbdcContract.queryFilter(
        cbdcContract.filters.swapDispatched(),
        prevBlockNumber,
        prevBlockNumber
    ) as TypedEventLog[];
    if (dispatchEvents.length > 0) {
        swapNonce = dispatchEvents[0].args._reqNonce;
    }
    console.log("[DEBUG] swapNonce:", swapNonce);
    console.time("Waiting swap acknowledgement");
    const swapAcknowledged = await TimeoutExecution(async (retry) => {
   
        const currentBlockNumber = await ethers.provider.getBlockNumber();
        const events = await cbdcContract.queryFilter(
            cbdcContract.filters.swapAcknowledged(),
            prevBlockNumber,
            currentBlockNumber
        ) as TypedEventLog[];
        prevBlockNumber = currentBlockNumber;
        if (events.length > 0 && events[0].args._reqNonce == swapNonce) {
            return [true, events[0].args._reqNonce];
        } else return [false, BigInt(0)];
    });
    console.timeEnd("Waiting swap acknowledgement");
    console.log("[DEBUG] swapAcknowledged:", swapAcknowledged);

    const balancRTAfter = await getBalanceRTSync(
        endpointContract, 
        rtResourceId, 
        clientSigner, 
        clientSigner.address
    ) ?? BigInt(0);
    console.log("[DEBUG] balancRTAfter:", balancRTAfter);

    const balanceCDBCAfter = await getBalanceCBDCSync(
        endpointContract, 
        cbdcResourceId, 
        deployerSigner, 
        walletDefault
    ) ?? BigInt(0);
    console.log("[DEBUG] balanceCDBCAfter:", balanceCDBCAfter);

}

example4()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

