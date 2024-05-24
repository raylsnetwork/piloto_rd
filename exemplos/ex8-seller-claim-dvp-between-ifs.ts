import { ethers } from "hardhat";
import {
    getBalanceCBDCSync, 
    getPLInformation, 
    TimeoutExecution 
} from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import tpftOpContractABI from "../abi/TPFToperation.json";

async function example8() {
    const { 
        chainId,
        endpointContractAddr, 
        deployerSigner,
        cbdcResourceId,
        tpftOpResourceId
    } = await getPLInformation();

    const chainIdDestination = process.env.DEST_CHAINID ?? 0;
    const destinationWd = process.env.DEST_RESERVES_ACC ?? "";

    const tpftOperationAmount = BigInt(100);
    const tpftOperationPrice = BigInt(500);

    const tpftToMintData =  { 
        acronym: 'LTN', 
        code: 'BRSTNCLTN7D3', 
        maturityDate: 1716584638 
    };

    const opData = {
        operationId: Math.floor(new Date().getTime() / 1000).toString(), // ID da operação
        chainIdSeller: chainId, // ID vendedor, tpft owner
        chainIdBuyer: chainIdDestination, // ID comprador, cbdc owner
        accountSeller: deployerSigner.address, // Endereço do vendedor
        accountBuyer: destinationWd, // Endereço do comprador
        tpftData: tpftToMintData,
        tpftAmount: tpftOperationAmount, // Quantidade de TPFt
        price: tpftOperationPrice, // Preço
        status: 0, // status da operação inicialmente zerado (EMPTY)
        isBetweenClients: false // Se é, ou não, entre clientes
    };

    // Recuperando contratos Endpoint das PLs envolvidas
    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        deployerSigner
    );
    
    // Checando saldo de CBDC antes do resgate
    const balanceBefore = await getBalanceCBDCSync(
        endpointContract, 
        cbdcResourceId, 
        deployerSigner, 
        deployerSigner.address
    );
    console.log("[DEBUG] balanceBefore", balanceBefore);
 
    // Seller invocando o resgate do DVP
    console.log("[DEBUG] Registering operation as seller...");
    const tpftOpAddress = await endpointContract
        .resourceIdToContractAddress(
            tpftOpResourceId
        );
    const tpftOpContract = await ethers.getContractAt(
        tpftOpContractABI, 
        tpftOpAddress, 
        deployerSigner
    );
    let txTPFT = await tpftOpContract.claimOperation(opData);
    await txTPFT.wait();

    // Checando atualização de estado após solicitação de resgate
    await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting register response from DVP contract", retry);
        const _op = await tpftOpContract.operations(opData.operationId);
        if (_op.status != BigInt(3)) {
            console.log("[DEBUG] Status:", _op.status);
            return [true, _op.status];
        } else return [false, false];
    });
    
    // Checando saldo de CBDC depois do resgate
    const balanceAfter = await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting CBDC balance to be updated:", retry);
        const balanceCBDC = await getBalanceCBDCSync(
            endpointContract, 
            cbdcResourceId, 
            deployerSigner, 
            deployerSigner.address
        );
        if (balanceCBDC != balanceBefore) {
            console.log("[DEBUG] balanceCBDC", balanceCBDC);
            return [true, balanceCBDC];
        } else return [false, BigInt(0)];
    });
    console.log("[DEBUG] balanceAfter", balanceAfter);
}

example8()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

