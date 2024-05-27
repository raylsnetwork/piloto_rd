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
        tpftResourceId,
        tpftOpResourceId
    } = await getPLInformation();
    
    const [deployerSigner] = await ethers.getSigners();

    const chainIdDestination = process.env.DEST_CHAINID ?? 0;
    const destinationWd = process.env.DEST_RESERVES_ACC ?? "";

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

    // Recuperando contratos Endpoint das PLs envolvidas
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
    let txOpReg = await tpftOpContract.callRegisterOperation(opData);
    await txOpReg.wait();

    const newStatus = await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting register response from DVP contract", retry);
        const _op = await tpftOpContract.operations(opData.operationId);
        if (_op.status > prevStatus) {
            return [true, _op.status];
        } else return [false, false];
    });
    console.log("[DEBUG] newStatus:", newStatus);

    // Checando saldo de TPFt depois do registro
    const balanceAfter = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        deployerSigner, 
        deployerSigner.address, 
        opData.tpftData
    );
    console.log("[DEBUG] balanceAfter", balanceAfter);
}

example5()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

