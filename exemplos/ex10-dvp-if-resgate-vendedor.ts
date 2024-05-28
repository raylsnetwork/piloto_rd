import { ethers } from "hardhat";
import {
    getBalanceCBDCSync, 
    getPLInformation, 
    TimeoutExecution 
} from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import tpftOpContractABI from "../abi/TPFToperation.json";

async function example10() {
    const { 
        chainId,
        endpointContractAddr, 
        cbdcResourceId,
        tpftOpResourceId
    } = await getPLInformation();

    const [deployerSigner] = await ethers.getSigners();

    const chainIdDestination = process.env.DEST_CHAINID ?? 0;

    const tpftOperationAmount = BigInt(100);
    const tpftOperationPrice = BigInt(500);

    const tpftToMintData =  { 
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
        status: <Estado da operação (geralmente é igual a zero)>,
        isBetweenClients: <True, apenas quando for operação entre clientes. False, caso contrário.>
    };

    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        deployerSigner
    );

    const tpftOpAddress = await endpointContract
    .resourceIdToContractAddress(
        tpftOpResourceId
    );

    const tpftOpContract = await ethers.getContractAt(
        tpftOpContractABI, 
        tpftOpAddress, 
        deployerSigner
    );

    const op = await tpftOpContract.operations(opData.operationId);
    const prevStatus = op.status;
    console.log("[DEBUG] prevStatus:", prevStatus);

    const balanceBefore = await getBalanceCBDCSync(
        endpointContract, 
        cbdcResourceId, 
        deployerSigner, 
        deployerSigner.address
    );
    console.log("[DEBUG] balanceBefore", balanceBefore);
 
    console.log("[DEBUG] Claiming operation as seller...");
    let txClaim = await tpftOpContract.claimOperation(opData);
    await txClaim.wait();

    const newStatus = await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting claim response from DVP contract", retry);
        const _op = await tpftOpContract.operations(opData.operationId);
        if (_op.status > prevStatus) {
            return [true, _op.status];
        } else return [false, false];
    });
    console.log("[DEBUG] newStatus:", newStatus);
    
    const balanceAfter = await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting CBDC balance to be updated:", retry);
        const balanceCBDC = await getBalanceCBDCSync(
            endpointContract, 
            cbdcResourceId, 
            deployerSigner, 
            deployerSigner.address
        );
        if (balanceCBDC != balanceBefore) {
            return [true, balanceCBDC];
        } else return [false, BigInt(0)];
    });
    console.log("[DEBUG] balanceAfter", balanceAfter);
}

example10()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

