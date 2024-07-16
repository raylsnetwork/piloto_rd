import { ethers } from "hardhat";

import IEndpointABI from "../abi/IEndpoint.json";
import StrABI from "../abi/STR.json";
import RealTokenizadoABI from "../abi/RealTokenizado.json";
import TPFTopABI from "../abi/TPFToperation.json";

import StrBytecode from "../bytecode/STR.json";
import RealTokenizadoBytecode from "../bytecode/RealTokenizado.json";
import TPFTopBytecode from "../bytecode/TPFToperation.json";

async function main() {
    const endpointAddr = process.env.ENDPOINT_ADDR ?? "";
    const chainIdBacen = process.env.CHAINID_BACEN ?? "";
    const chainIdSelic = process.env.CHAINID_SELIC ?? "";
    const cbdcResourceId = process.env.RESOURCEID_CBDC ?? "";
    const tpftResourceId = process.env.RESOURCEID_TPFT ?? "";
    const dvpAddress = process.env.DVP_CLAIM_ADDRESS ?? "";

    const [deployerSigner] = await ethers.getSigners();

    const strResourceId = ethers.id("STR");
    const wdResourceId = ethers.id("WalletDefault");
    const rtResourceId = ethers.id("RealTokenizado");
    const dvpResourceId = ethers.id("DVP");
    const tpftOpResourceId = ethers.id("TPFToperation");

    // Instanciando IEndpoint para registrar os Resource Ids relevantes
    const endpointIf = await ethers.getContractAt(
        IEndpointABI, 
        endpointAddr,
        deployerSigner
    );

    // Registrando Wallet Default
    console.log("[DEBUG] Registering Wallet Default's Resource Id...");
    const txRegWD = await endpointIf.registerResourceId(
        wdResourceId, 
        deployerSigner.address
    );
    await txRegWD.wait();
    console.log(
        `[DEBUG] Wallet Default registered to Resource Id '${wdResourceId}' with address '${deployerSigner.address}'.`
    );

    // Deploy e registro do contrato STR
    console.log("[DEBUG] Deploying and registering STR contract ...");
    const strContractFactory = new ethers.ContractFactory(
        StrABI, 
        StrBytecode, 
        deployerSigner
    );
    const strContract = await strContractFactory.deploy(
        endpointAddr,
        chainIdBacen,
        cbdcResourceId,
        wdResourceId
    )
    await strContract.waitForDeployment();
    const txRegSTR = await endpointIf.registerResourceId(
        strResourceId, 
        strContract.target
    );
    await txRegSTR.wait();
    console.log(`
        [DEBUG] STR deployed and registered to Resource Id '${strResourceId}' with address '${strContract.target}'.`
    );

    // Deploy e registro do contrato RealTokenizado
    console.log("[DEBUG] Deploying and registering RealTokenizado contract ...");
    const rtContractFactory = new ethers.ContractFactory(
        RealTokenizadoABI, 
        RealTokenizadoBytecode, 
        deployerSigner
    );
    const rtContract = await rtContractFactory.deploy("RealTokenizado", "R$");
    await rtContract.waitForDeployment();
    const txRegRT = await endpointIf.registerResourceId(
        rtResourceId, 
        rtContract.target
    );
    await txRegRT.wait();
    console.log(`
        [DEBUG] RealTokenizado deployed and registered to Resource Id '${rtResourceId}' with address '${rtContract.target}'.`
    );

    // Deploy e registro do contrato DVP
    console.log("[DEBUG] Deploying and registering TPFToperation contract ...");
    const tpftOpContractFactory = new ethers.ContractFactory(
        TPFTopABI, 
        TPFTopBytecode, 
        deployerSigner
    );
    const tpftOpContract = await tpftOpContractFactory.deploy(
        endpointAddr, 
        chainIdSelic,
        cbdcResourceId,
        tpftResourceId,
        dvpResourceId,
        rtResourceId,
        dvpAddress
    )
    await tpftOpContract.waitForDeployment();
    const txRegOpClaim = await endpointIf.registerResourceId(
        tpftOpResourceId, 
        tpftOpContract.target
    );
    await txRegOpClaim.wait();
    console.log(`
        [DEBUG] TPFToperation deployed and registered to Resource Id '${tpftOpResourceId}' with address '${tpftOpContract.target}'.`
    );
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });