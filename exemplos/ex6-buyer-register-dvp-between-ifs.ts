import { ethers } from "hardhat";
import {
    getBalanceCBDCSync, 
    getPLInformation, 
    TimeoutExecution 
} from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import tpftOpContractABI from "../abi/TPFToperation.json";

async function example6() {
    // const { 
    //     chainId,
    //     endpointContractAddr, 
    //     deployerSigner,
    //     cbdcResourceId,
    //     tpftOpResourceId
    // } = await getPLInformation();

    // REMOVER
    const { 
        chainId,
        cbdcResourceId,
        tpftOpResourceId
    } = await getPLInformation();
    const endpointContractAddr = "0xBed8E9B29BD9D2FDeAE12cDA9Cd8E981cFF2865f";
    const [deployerSigner] = await ethers.getSigners();
    // REMOVER


    const chainIdDestination = process.env.DEST_CHAINID ?? 0;
    const destinationWd = process.env.DEST_RESERVES_ACC ?? "";

    const tpftOperationAmount = BigInt(100);
    const tpftOperationPrice = BigInt(500);

    const tpftToMintData =  { 
        acronym: 'LTN', 
        code: 'BRSTNCLTN7D3', 
        maturityDate: 1716584638 
    };

    // const opData = {
    //     operationId: Math.floor(new Date().getTime() / 1000).toString(), // ID da operação
    //     chainIdSeller: chainIdDestination, // ID vendedor, tpft owner
    //     chainIdBuyer: chainId, // ID comprador, cbdc owner
    //     accountSeller: destinationWd, // Endereço do vendedor
    //     accountBuyer: deployerSigner.address, // Endereço do comprador
    //     tpftData: tpftToMintData,
    //     tpftAmount: tpftOperationAmount, // Quantidade de TPFt
    //     price: tpftOperationPrice, // Preço
    //     status: 0, // status da operação inicialmente zerado (EMPTY)
    //     isBetweenClients: false // Se é, ou não, entre clientes
    // };

    // REMOVER
    const opData = {
        operationId: "1716586243", // ID da operação
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
    // REMOVER

    // Recuperando contratos Endpoint das PLs envolvidas
    console.log("[DEBUG] endpointContract");
    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        deployerSigner
    );


    console.log("[DEBUG] balanceBefore");
    const balanceBefore = await getBalanceCBDCSync(
        endpointContract, 
        cbdcResourceId, 
        deployerSigner, 
        deployerSigner.address
    );
    console.log("[DEBUG] balanceBefore", balanceBefore);
    
    // Buyer invocando o registro do DVP
    console.log("[DEBUG] Registering operation as buyer...");
    const tpftOpContractAddr = await endpointContract.resourceIdToContractAddress(
        tpftOpResourceId
    );
    const tpftOpContract = await ethers.getContractAt(
        tpftOpContractABI, 
        tpftOpContractAddr, 
        deployerSigner
    );
    const txOpsB = await tpftOpContract.callRegisterOperation(opData);
    await txOpsB.wait();

    //Checando se o burn de CBDC foi feito na PL BUYER e se chegou na SELIC
    const balanceAfter = await getBalanceCBDCSync(
        endpointContract, 
        cbdcResourceId, 
        deployerSigner, 
        deployerSigner.address
    );
    console.log("[DEBUG] balanceAfter", balanceAfter);

    await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting register response from DVP contract", retry);
        const _op = await tpftOpContract.operations(opData.operationId);
        console.log("[DEBUG] Status:", _op.status);
        if (_op.status != BigInt(1)) {
            console.log("[DEBUG] Status:", _op.status);
            return [true, _op.status];
        } else return [false, false];
    });
}

example6()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

