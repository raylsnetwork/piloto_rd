import { ethers } from "hardhat";
import {
    getBalanceTPFTSync, 
    getPLInformation, 
    TimeoutExecution 
} from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import tpftOpContractABI from "../abi/TPFToperation.json";

async function example7() {
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
        maturityDate: 1716297074 
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

    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        deployerSigner
    );

    // Checando saldo de TPFt antes de registrar a operação
    const balanceBefore = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        deployerSigner, 
        deployerSigner.address, 
        opData.tpftData
    );
    console.log("DEBUG balanceBefore", balanceBefore);

    // Seller invocando o registro da operação
    const addressTPFTOpsIFA = await endpointContract.resourceIdToContractAddress(
        tpftOpResourceId
    );
    const tpftOpContract = await ethers.getContractAt(
        tpftOpContractABI, 
        addressTPFTOpsIFA, 
        deployerSigner
    );
    let txTPFT = await tpftOpContract.callRegisterOperation(opData);
    await txTPFT.wait();

    // Checando se o burn de TPFt foi feito após o registro
    const balanceAfterRegister = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        deployerSigner, 
        deployerSigner.address,
        opData.tpftData
    );
    console.log("[DEBUG] balanceAfterRegister:", balanceAfterRegister);

    // Checando se o estado da operação foi atualizado, em resposta da SELIC
    await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting register response from DVP contract", retry);
        const _op = await tpftOpContract.operations(opData.operationId);
        if (_op.status == BigInt(1)) {
            console.log("[DEBUG] Status:", _op.status);
            return [true, _op.status];
        } else return [false, false];
    });

    // Invocando solicitação de reversão do registro da operação
    const txRevertA = await tpftOpContract.requestRevertOperation(opData);
    await txRevertA.wait();

    // Checando se o saldo de TPFt volta após a reversão
    const balanceAfterRevertion = await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Find TPFt balance A ", retry);
        const balanceTPFt = await getBalanceTPFTSync(
            endpointContract, 
            tpftResourceId, 
            deployerSigner, 
            deployerSigner.address, 
            opData.tpftData
        );
        if (balanceTPFt != balanceAfterRegister) {
            return [true, balanceTPFt];
        } else return [false, BigInt(0)];
    });
    console.log("[DEBUG] balanceAfterRevertion:", balanceAfterRevertion);
}

example7()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

