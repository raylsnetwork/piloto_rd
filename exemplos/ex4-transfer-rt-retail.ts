import { ethers } from "hardhat";
import { getBalanceCBDCSync, getBalanceRTSync, getPLInformation, TimeoutExecution } from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import CbdcABI from "../abi/CBDC.json";
import RealTokenizadoABI from "../abi/RealTokenizado.json";

async function example4() {
    const { 
        endpointContractAddr, 
        deployerSigner,
        clientSigner,
        cbdcResourceId,
        wdResourceId,
        rtResourceId
    } = await getPLInformation();

    const chainIdDestination = process.env.DEST_CHAINID ?? 0;
    const destClientAcc = process.env.DEST_CLIENT_ACC ?? 0;

    const amountToMintAndSwap = ethers.parseUnits("10", 2);

    // IF A: Recuperando endereços CBDC contract, Real Tokenizado contract e Wallet Default IF A
    const endpointA = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        deployerSigner
    );

    const walletDefault = await endpointA.resourceIdToContractAddress(
        wdResourceId
    );
    const realTokenizadoAddressIFA = await endpointA.resourceIdToContractAddress(
        rtResourceId
    );
    const cbdcContractAddr = await endpointA.resourceIdToContractAddress(
        cbdcResourceId
    );

    // Mint Real Tokenizado para que haja saldo ao transferir
    const realtokenizadoA = await ethers.getContractAt(
        RealTokenizadoABI, 
        realTokenizadoAddressIFA, 
        deployerSigner
    );
    console.log("[DEBUG] Minting Real Tokenizado for the client at origin...");
    const txMint = await realtokenizadoA.mint(clientSigner.address, amountToMintAndSwap);
    await txMint.wait();

    const cbdcContract = await ethers.getContractAt(
        CbdcABI, 
        cbdcContractAddr, 
        clientSigner
    ); 

    // Checando saldos antes do envio
    const balancRTBefore = await getBalanceRTSync(
        endpointA, 
        rtResourceId, 
        clientSigner, 
        clientSigner.address
    ) ?? BigInt(0);
    console.log("[DEBUG] balancRTBefore:", balancRTBefore);

    const balanceCDBCBefore = await getBalanceCBDCSync(
        endpointA, 
        cbdcResourceId, 
        deployerSigner, 
        walletDefault
    ) ?? BigInt(0);
    console.log("[DEBUG] balanceCDBCBefore:", balanceCDBCBefore);

    console.log(`[DEBUG] swap ...`);
    const txSwap = await cbdcContract.swap(
        chainIdDestination, 
        cbdcResourceId, 
        destClientAcc, 
        amountToMintAndSwap, 
        { gasLimit: 9000000000 }
    );
    await txSwap.wait();

    // Checando saldos antes do envio
    const balancRTAfter = await getBalanceRTSync(
        endpointA, 
        rtResourceId, 
        clientSigner, 
        clientSigner.address
    ) ?? BigInt(0);
    console.log("[DEBUG] balancRTAfter:", balancRTAfter);

    const balanceCDBCAfter = await getBalanceCBDCSync(
        endpointA, 
        cbdcResourceId, 
        deployerSigner, 
        walletDefault
    ) ?? BigInt(0);
    console.log("[DEBUG] balanceCDBCAfter:", balanceCDBCAfter);

}

example4()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

