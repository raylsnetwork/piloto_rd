import { ethers } from "hardhat";
import {
    getBalanceTPFTSync, 
    getPLInformation, 
    TimeoutExecution 
} from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import tpftOpContractABI from "../abi/TPFToperation.json";

async function example5() {
    const { 
        chainId,
        endpointContractAddr, 
        deployerSigner,
        tpftResourceId,
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

    console.log("[DEBUG] opData.operationId", opData.operationId)

    // Recuperando contratos Endpoint das PLs envolvidas
    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        deployerSigner
    );
    
    // Checando saldo de TPFt antes do registro
    const balanceBefore = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        deployerSigner, 
        deployerSigner.address, 
        opData.tpftData
    );
    console.log("[DEBUG] balanceBefore:", balanceBefore);
 
    // Seller invocando o registro do DVP
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
    let txTPFT = await tpftOpContract.callRegisterOperation(opData);
    await txTPFT.wait();

    // Checando saldo de TPFt depois do registro
    const balanceAfter = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        deployerSigner, 
        deployerSigner.address, 
        opData.tpftData
    );
    console.log("[DEBUG] balanceAfter", balanceAfter);
   
    await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting register response from DVP contract", retry);
        const _op = await tpftOpContract.operations(opData.operationId);
        if (_op.status != BigInt(0)) {
            console.log("[DEBUG] Status:", _op.status);
            return [true, _op.status];
        } else return [false, false];
    });
}

example5()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

