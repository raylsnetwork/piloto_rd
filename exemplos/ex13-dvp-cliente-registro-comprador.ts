import { ethers } from "hardhat";
import {
    getBalanceCBDCSync,
    getBalanceRTSync, 
    getPLInformation, 
    TimeoutExecution 
} from "../utils/utils";
import cbdcContractABI from "../abi/CBDC.json";
import IendpointContractABI from "../abi/IEndpoint.json";
import RealTokenizadoABI from "../abi/RealTokenizado.json";
import tpftOpContractABI from "../abi/TPFToperation.json";

async function example13() {
    const { 
        chainId,
        endpointContractAddr,
        cbdcResourceId,
        rtResourceId,
        tpftOpResourceId
    } = await getPLInformation();

    const [deployerSigner, clientSigner] = await ethers.getSigners();

    console.log("[DEBUG] BUYER deployerSigner:", deployerSigner.address);
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

    const realTokenizadoAddr = await endpointContract.resourceIdToContractAddress(
        rtResourceId
    );

    const realTokenizadoContract = await ethers.getContractAt(
        RealTokenizadoABI, 
        realTokenizadoAddr, 
        clientSigner
    );

    const approvalAmount = (opData.tpftAmount * opData.price) / BigInt(10) ** BigInt(2);

    console.log("[DEBUG] Approving RealTokenizado amount for TPFToperation contract address...");
    const txApproveRT = await realTokenizadoContract
        .approve(
            tpftOpAddress, 
            approvalAmount
        );
    await txApproveRT.wait();

    const cbdcContractAddr = await endpointContract
        .resourceIdToContractAddress(
            cbdcResourceId
        );

    const cbdcContract = await ethers.getContractAt(
        cbdcContractABI, 
        cbdcContractAddr, 
        deployerSigner
    );

    console.log("[DEBUG] Approving CBDC amount for TPFToperation contract address...");
    const txApproveCbdc = await cbdcContract
        .approve(
            tpftOpAddress, 
            approvalAmount
        );
    await txApproveCbdc.wait();

    console.log("[DEBUG] Registering operation as buyer...");
    const txOpReg = await tpftOpContract.callRegisterOperation(opData);
    await txOpReg.wait();
    console.time("Waiting register response from DVP contract");
    const newStatus = await TimeoutExecution(async (retry) => {
        
        const _op = await tpftOpContract.operations(opData.operationId);
        if (_op.status > prevStatus) {
            return [true, _op.status];
        } else return [false, false];
    });
    console.timeEnd("Waiting register response from DVP contract");
    console.log("[DEBUG] newStatus:", newStatus);

    const balanceCBDCAfter = await getBalanceCBDCSync(
        endpointContract, 
        cbdcResourceId, 
        deployerSigner, 
        deployerSigner.address
    );
    console.log("[DEBUG] balanceCBDCAfter", balanceCBDCAfter);

    const balanceRTAfter = await getBalanceRTSync(
        endpointContract, 
        rtResourceId, 
        clientSigner, 
        clientSigner.address
    );
    console.log("[DEBUG] balanceRTAfter", balanceRTAfter);
}

example13()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

