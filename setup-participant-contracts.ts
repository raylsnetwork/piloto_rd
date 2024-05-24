import { ethers } from "hardhat";

import IEndpointABI from "./abi/IEndpoint.json";
import StrABI from "./abi/STR.json";
import RealTokenizadoABI from "./abi/RealTokenizado.json";
import TPFTopABI from "./abi/TPFToperation.json";

import StrBytecode from "./bytecode/STR.json";
import RealTokenizadoBytecode from "./bytecode/RealTokenizado.json";
import TPFTopBytecode from "./bytecode/TPFToperation.json";

async function main() {
    const gasConfig = { gasLimit: BigInt(process.env.RAYLS_GASLIMIT ?? 3000000) };

    const endpointAddrIf = process.env.ENDPOINT_ADDR ?? "";
    const chainIdBacen = process.env.CHAINID_BACEN ?? "";
    const chainIdSelic = process.env.CHAINID_SELIC ?? "";
    const cbdcResourceId = process.env.RESOURCEID_CBDC ?? "";
    const tpftResourceId = process.env.RESOURCEID_TPFT ?? "";
    const dvpAddress = process.env.DVP_CLAIM_ADDRESS ?? "";

    const [deployerSigner] = await ethers.getSigners();

    const strResourceId = ethers.id("STR" + process.env.ENV_VERSION);
    const wdResourceId = ethers.id("WalletDefault" + process.env.ENV_VERSION);
    const rtResourceId = ethers.id("RealTokenizado" + process.env.ENV_VERSION);
    const dvpResourceId = ethers.id("DVP" + process.env.ENV_VERSION);
    const tpftOpResourceId = ethers.id("TPFToperation" + process.env.ENV_VERSION)

    // Instanciando IEndpoint para registrar os Resource Ids relevantes
    const endpointIf = await ethers.getContractAt(IEndpointABI, endpointAddrIf,
        deployerSigner
    );

    // Registrando Wallet Default
    console.log("[DEBUG] Registering Wallet Default's Resource Id...");
    const txRegWD = await endpointIf.registerResourceId(wdResourceId, deployerSigner.address);
    await txRegWD.wait();
    console.log(`[DEBUG] Wallet Default registered to Resource Id '${wdResourceId}' with address '${deployerSigner.address}'.`);

    // Deploy e registro do contrato STR
    console.log("[DEBUG] Deploying and registering STR contract ...");
    
    const strContractFactory = new ethers.ContractFactory(StrABI, StrBytecode, deployerSigner);
    // const strContractFactory = await ethers.getContractFactory("STR", signerIf);
    const strContract = await strContractFactory.deploy(
        endpointAddrIf,
        chainIdBacen,
        cbdcResourceId,
        wdResourceId,
        gasConfig
    )
    await strContract.waitForDeployment();
    const txRegSTR = await endpointIf.registerResourceId(strResourceId, strContract.target);
    await txRegSTR.wait();
    console.log(`[DEBUG] STR deployed and registered to Resource Id '${strResourceId}' with address '${strContract.target}'.`);

    // Deploy e registro do contrato RealTokenizado
    console.log("[DEBUG] Deploying and registering RealTokenizado contract ...");
    
    const rtContractFactory = new ethers.ContractFactory(RealTokenizadoABI, RealTokenizadoBytecode, deployerSigner);
    // const rtContractFactory = await ethers.getContractFactory("RealTokenizado", signerIf);
    const rtContract = await rtContractFactory.deploy("RealTokenizado", "R$", gasConfig);
    await rtContract.waitForDeployment();
    const txRegRT = await endpointIf.registerResourceId(rtResourceId, rtContract.target);
    await txRegRT.wait();
    console.log(`[DEBUG] RealTokenizado deployed and registered to Resource Id '${rtResourceId}' with address '${rtContract.target}'.`);

    // Deploy e registro do contrato DVP
    console.log("[DEBUG] Deploying and registering TPFToperation contract ...");
    const tpftOpContractFactory = new ethers.ContractFactory(TPFTopABI, TPFTopBytecode, deployerSigner);
    // const tpftOpContractFactory = await ethers.getContractFactory("TPFToperation", signerIf);
    const tpftOpContract = await tpftOpContractFactory.deploy(
        endpointAddrIf, 
        chainIdSelic,
        cbdcResourceId,
        tpftResourceId,
        dvpResourceId,
        rtResourceId,
        dvpAddress,
        gasConfig
    )
    await tpftOpContract.waitForDeployment();
    const txRegOpClaim = await endpointIf.registerResourceId(tpftOpResourceId, tpftOpContract.target);
    await txRegOpClaim.wait();
    console.log(`[DEBUG] TPFToperation deployed and registered to Resource Id '${tpftOpResourceId}' with address '${rtContract.target}'.`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });