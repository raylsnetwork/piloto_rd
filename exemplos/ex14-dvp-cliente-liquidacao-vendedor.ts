import { ethers } from "hardhat";
import {
    getBalanceCBDCSync,
    getBalanceRTSync, 
    getPLInformation, 
    TimeoutExecution 
} from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import tpftOpContractABI from "../abi/TPFToperation.json";

async function example14() {
    const { 
        chainId,
        endpointContractAddr,
        cbdcResourceId,
        rtResourceId,
        tpftOpResourceId
    } = await getPLInformation();

    const [deployerSigner, clientSigner] = await ethers.getSigners();

    console.log("[DEBUG] SELLER deployerSigner:", deployerSigner.address);
    console.log("[DEBUG] SELLER clientSigner:", clientSigner.address);
    
    const chainIdDestination = process.env.DEST_CHAINID ?? 0;

    const tpftOperationAmount = BigInt(100);
    const tpftOperationPrice = BigInt(500);

    const tpftDvpData =  { 
        acronym: '<acrônimo do título público>', 
        code: '<código do título público>', 
        maturityDate: <data de validade do título público> 
    };

    const opData = {
        operationId: '<ID da operação>',
        chainIdSeller: <Chain ID da PL vendedora>,
        chainIdBuyer: <Chain ID da PL compradora>,
        accountSeller: '<conta vendedora>',
        accountBuyer: '<conta compradora>',
        tpftData: <TPFt data>,
        tpftAmount: <Quantidade de TPFt da operação>,
        price: <Preço a ser pago por TPFt>,
        status: <Estado da operação (p/ vendedor: 1)>,
        isBetweenClients: <True, apenas quando for operação entre clientes. False, caso contrário.>
    };

    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        clientSigner
    );

    const tpftOpAddress = await endpointContract
        .resourceIdToContractAddress(
            tpftOpResourceId
        );

    const tpftOpContract = await ethers.getContractAt(
        tpftOpContractABI, 
        tpftOpAddress, 
        clientSigner
    );

    const op = await tpftOpContract.operations(opData.operationId);
    const prevStatus = op.status;
    console.log("[DEBUG] prevStatus:", prevStatus);

    const balanceCBDCBefore = await getBalanceCBDCSync(
        endpointContract, 
        cbdcResourceId, 
        deployerSigner, 
        deployerSigner.address
    );
    console.log("[DEBUG] balanceCBDCBefore", balanceCBDCBefore);

    const balanceRTBefore = await getBalanceRTSync(
        endpointContract, 
        rtResourceId, 
        clientSigner, 
        clientSigner.address
    );
    console.log("[DEBUG] balanceRTBefore", balanceRTBefore);
    
    console.log("[DEBUG] Claiming operation as seller...");
    const txClaim = await tpftOpContract.claimOperation(opData);
    await txClaim.wait();

    const newStatus = await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting claim response from DVP contract", retry);
        const _op = await tpftOpContract.operations(opData.operationId);
        if (_op.status > prevStatus) {
            return [true, _op.status];
        } else return [false, false];
    });
    console.log("[DEBUG] newStatus:", newStatus);

    const balanceCBDCAfter = await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting CBDC balance to be updated", retry);
        const balanceCBDC = await getBalanceCBDCSync(
            endpointContract, 
            cbdcResourceId, 
            deployerSigner, 
            deployerSigner.address
        );
        if (balanceCBDC != balanceCBDCBefore) {
            return [true, balanceCBDC];
        } else return [false, BigInt(0)];
    });
    console.log("[DEBUG] balanceCBDCAfter:", balanceCBDCAfter);

    const balanceRTAfter = await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting RealTokenizado balance to be updated", retry);
        const balanceRT = await getBalanceRTSync(
            endpointContract, 
            rtResourceId, 
            clientSigner, 
            clientSigner.address
        );
        if (balanceRT != balanceRTBefore) {
            return [true, balanceRT];
        } else return [false, BigInt(0)];
    });
    console.log("[DEBUG] balanceRTAfter:", balanceRTAfter);
}

example14()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

