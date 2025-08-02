import { ethers } from "hardhat";
import { getBalanceTPFTSync, getPLInformation } from "../utils/utils";
import IendpointContractABI from "../abi/EndpointV1.json";
import TpftABI from "../abi/TPFt.json";

async function example11() {
    const {
        endpointContractAddr,
        tpftResourceId,
        deployerSigner,
        clientSigner
    } = await getPLInformation();

    //const [deployerSigner, clientSigner] = await ethers.getSigners();
    
    const amountToTransfer = BigInt(100);

    
    // const tpftToTransferData =  { 
    //     acronym: '<acrônimo do título público>', 
    //     code: '<código do título público>', 
    //     maturityDate: <data de validade do título público> 
    // };
    const tpftToTransferData = { acronym: process.env.TPFT_ACRONYM??"", code: process.env.TPFT_CODE??"", maturityDate: process.env.TPFT_MATURITY_DATE?Number(process.env.TPFT_MATURITY_DATE):0 };

    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        deployerSigner
    );

    const tpftContractAddr = await endpointContract.getAddressByResourceId(
        tpftResourceId
    );
    
    const tpftContract = await ethers.getContractAt(
        TpftABI, 
        tpftContractAddr, 
        deployerSigner
    );

    const balanceWdBefore = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        deployerSigner, 
        deployerSigner.address, 
        tpftToTransferData
    );
    console.log("[DEBUG] balanceWdBefore", balanceWdBefore);
    
    const balanceClientBefore = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        clientSigner, 
        clientSigner.address, 
        tpftToTransferData
    );
    console.log("[DEBUG] balanceClientBefore", balanceClientBefore);

    console.log("[DEBUG] Transfering TPFt...");
    const tokenId = await tpftContract.getTPFtId(
        tpftToTransferData.acronym,
        tpftToTransferData.code,
        tpftToTransferData.maturityDate
    );
    console.log("[DEBUG] tokenId:", tokenId);
    const txTpftTransfer = await tpftContract.safeTransferFrom(
        deployerSigner.address,
        clientSigner.address,
        tokenId,
        amountToTransfer,
        ethers.ZeroHash
    );
    console.log("[DEBUG] waiting...");
    await txTpftTransfer.wait();

    console.log("[DEBUG] Checking balances...");
    const balanceWdAfter = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        deployerSigner, 
        deployerSigner.address, 
        tpftToTransferData
    );
    console.log("[DEBUG] balanceWdAfter", balanceWdAfter);

    const balanceClientAfter = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        clientSigner, 
        clientSigner.address, 
        tpftToTransferData
    );
    console.log("[DEBUG] balanceClientAfter", balanceClientAfter);

}

example11()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

