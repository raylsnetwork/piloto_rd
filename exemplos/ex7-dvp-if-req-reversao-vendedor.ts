import { ethers } from "hardhat";
import {
    getBalanceTPFTSync, 
    getPLInformation, 
    TimeoutExecution 
} from "../utils/utils";
import IendpointContractABI from "../abi/EndpointV1.json";
import tpftOpContractABI from "../abi/TPFToperation.json";

async function example7() {
    const { 
        chainId,
        endpointContractAddr,
        tpftResourceId,
        tpftOpResourceId,
        deployerSigner
    } = await getPLInformation();
    
    //const [deployerSigner] = await ethers.getSigners();

    const chainIdDestination = process.env.DEST_CHAINID ?? 0;
    const destinationWd = process.env.DEST_RESERVES_ACC ?? "";

    const tpftOperationAmount = BigInt(100);
    const tpftOperationPrice = BigInt(500);

    // const tpftDvpData =  { 
    //     acronym: '<acrônimo do título público>', 
    //     code: '<código do título público>', 
    //     maturityDate: <data de validade do título público> 
    // };
    const tpftDvpData = { acronym: process.env.TPFT_ACRONYM??"", code: process.env.TPFT_CODE??"", maturityDate: process.env.TPFT_MATURITY_DATE?Number(process.env.TPFT_MATURITY_DATE):0 };

    // const opData = {
    //     operationId: '<ID da operação>',
    //     chainIdSeller: <Chain ID da PL vendedora>,
    //     chainIdBuyer: <Chain ID da PL compradora>,
    //     accountSeller: '<conta vendedora>',
    //     accountBuyer: '<conta compradora>',
    //     tpftData: <TPFt data>,
    //     tpftAmount: <Quantidade de TPFt da operação>,
    //     price: <Preço a ser pago por TPFt>,
    //     status: <Estado da operação (p/ vendedor: 1)>,
    //     isBetweenClients: <True, apenas quando for operação entre clientes. False, caso contrário.>
    // };

    const opData = {
            operationId: process.env.TPFT_OP_ID ?? "", // ID da operação
            chainIdSeller: chainId, // ID vendedor, tpft owner
            chainIdBuyer: chainIdDestination, // ID comprador, cbdc owner
            accountSeller: deployerSigner.address, // Endereço do vendedor
            accountBuyer: destinationWd, // Endereço do comprador
            tpftData: tpftDvpData,
            tpftAmount: tpftOperationAmount, // Quantidade de TPFt
            price: tpftOperationPrice, // Preço
            status: 1, // status da operação
            isBetweenClients: false // Se é, ou não, entre clientes
        };
        console.log("[DEBUG] opData:", opData);

    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        deployerSigner
    );

    const tpftOpAddress = await endpointContract.getAddressByResourceId(
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

    const balanceBefore = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        deployerSigner, 
        deployerSigner.address, 
        opData.tpftData
    );
    console.log("DEBUG balanceBefore", balanceBefore);

    const txRevert = await tpftOpContract.requestRevertOperation(opData);
    await txRevert.wait();
    console.log("Waiting register response from DVP contract...");
    console.time("Waiting register response from DVP contract");
    // //sleep for 30 seconds
    // const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    // await sleep(30000);

    const newStatus = await TimeoutExecution(async (retry) => {
     
        const _op = await tpftOpContract.operations(opData.operationId);
        if (_op.status > prevStatus) {
            return [true, _op.status];
        } else return [false, _op.status];
    });
    console.timeEnd("Waiting register response from DVP contract");
    
    console.log("[DEBUG] newStatus:", newStatus);
    const balanceAfterRevertion = await TimeoutExecution(async (retry) => {

        const balanceTPFt = await getBalanceTPFTSync(
            endpointContract, 
            tpftResourceId, 
            deployerSigner, 
            deployerSigner.address, 
            opData.tpftData
        );
        if (balanceTPFt != balanceBefore) {
            return [true, balanceTPFt];
        } else return [false, balanceTPFt];
    });
    console.log("[DEBUG] balanceAfterRevertion:", balanceAfterRevertion);
}

example7()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

