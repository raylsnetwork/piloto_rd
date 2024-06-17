import { ethers } from "hardhat";
import {
    getBalanceTPFTSync, 
    getPLInformation, 
    TimeoutExecution 
} from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import tpftOpContractABI from "../abi/TPFToperation.json";

async function example15() {
    const { 
        chainId,
        endpointContractAddr,
        tpftResourceId,
        tpftOpResourceId
    } = await getPLInformation();

    const [_, clientSigner] = await ethers.getSigners();

    console.log("[DEBUG] BUYER clientSigner:", clientSigner.address);

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
        status: <Estado da operação (p/ comprador: 2)>,
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
    
    const balanceBefore = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        clientSigner, 
        clientSigner.address, 
        opData.tpftData
    );
    console.log("[DEBUG] balanceBefore:", balanceBefore);
    
    console.log("[DEBUG] Claiming operation as buyer...");
    let txOpReg = await tpftOpContract.claimOperation(opData);
    await txOpReg.wait();

    const newStatus = await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Waiting register response from DVP contract", retry);
        const _op = await tpftOpContract.operations(opData.operationId);
        if (_op.status != prevStatus) {
            return [true, _op.status];
        } else return [false, false];
    });
    console.log("[DEBUG] newStatus:", newStatus);

    const balanceAfter = await TimeoutExecution(async (retry) => {
        console.log("[DEBUG] Find tpft balance at SELIC ", retry);
        const balanceTpfT = await getBalanceTPFTSync(
            endpointContract, 
            tpftResourceId, 
            clientSigner, 
            clientSigner.address, 
            opData.tpftData
        );
        if (balanceTpfT != balanceBefore) {
            return [true, balanceTpfT];
        } else return [false, BigInt(0)];
    });
    console.log("[DEBUG] balanceAfter:", balanceAfter);
}

example15()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

