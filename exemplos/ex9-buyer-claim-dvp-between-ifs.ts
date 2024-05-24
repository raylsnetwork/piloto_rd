import { ethers } from "hardhat";
import {
    getBalanceTPFTSync, 
    getPLInformation, 
    TimeoutExecution 
} from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import tpftOpContractABI from "../abi/TPFToperation.json";

async function example9() {
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
        chainIdSeller: chainIdDestination, // ID vendedor, tpft owner
        chainIdBuyer: chainId, // ID comprador, cbdc owner
        accountSeller: destinationWd, // Endereço do vendedor
        accountBuyer: deployerSigner.address, // Endereço do comprador
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
    
    // Checando saldo de TPFt antes do resgate
    const balanceBefore = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        deployerSigner, 
        deployerSigner.address, 
        opData.tpftData
    );
    console.log("[DEBUG] balanceBefore:", balanceBefore);
 
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

    
    // Checando saldo de CBDC depois do resgate
    const balanceAfter = await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting TPFt balance to be updated:", retry);

        const balanceTpfT = await getBalanceTPFTSync(
            endpointContract, 
            tpftResourceId, 
            deployerSigner, 
            deployerSigner.address, 
            opData.tpftData
        );
        if (balanceTpfT != balanceBefore) {
            console.log("[DEBUG] TPFT Balance B.", balanceTpfT);
            return [true, balanceTpfT];
        } else return [false, BigInt(0)];
    });
    console.log("[DEBUG] balanceAfter", balanceAfter);
   
    await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting register response from DVP contract", retry);
        const _op = await tpftOpContract.operations(opData.operationId);
        if (_op.status != BigInt(3)) {
            console.log("[DEBUG] Status:", _op.status);
            return [true, _op.status];
        } else return [false, false];
    });
}

example9()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

