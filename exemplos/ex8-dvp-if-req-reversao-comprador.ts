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
        cbdcResourceId,
        tpftOpResourceId
    } = await getPLInformation();
    
    const [deployerSigner] = await ethers.getSigners();

    const chainIdDestination = process.env.DEST_CHAINID ?? 0;
    const destinationWd = process.env.DEST_RESERVES_ACC ?? "";

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
        deployerSigner
    );

    const tpftOpAddress = await endpointContract.resourceIdToContractAddress(
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

    const txRevert = await tpftOpContract.requestRevertOperation(opData);
    await txRevert.wait();
    console.time("Waiting reversion response from DVP contract");
    const newStatus = await TimeoutExecution(async (retry) => {
      
        const _op = await tpftOpContract.operations(opData.operationId);
        if (_op.status > prevStatus) {
            return [true, _op.status];
        } else return [false, false];
    });
    console.timeEnd("Waiting reversion response from DVP contract");
    console.log("[DEBUG] newStatus:", newStatus);
    console.time("Waiting CBDC balance to be updated:");

    const balanceAfterRevertion = await TimeoutExecution(async (retry) => {
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
    console.timeEnd("Waiting CBDC balance to be updated:");
    console.log("[DEBUG] balanceAfterRevertion", balanceAfterRevertion);
}

example8()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

