import { ethers } from "hardhat";
import IendpointContractABI from "../abi/IEndpoint.json";
import RealTokenizadoABI from "../abi/RealTokenizado.json";


async function main() {
    const rpcUrlIf = process.env.RPCURL ?? "";
    const privateKeyIf = process.env.PRIVATEKEY_DEPLOYER ?? "";
    const endpointAddrIf = process.env.ENDPOINT_ADDR ?? "";
    const resourceIdCBDC = process.env.RESOURCEID_CBDC ?? "";
    const resourceIdRT = ethers.id("RealTokenizado")

    let providerIf = new ethers.JsonRpcProvider(rpcUrlIf);
    let signerIf = new ethers.Wallet(privateKeyIf, providerIf);

    const MINTER_ROLE = ethers.id("MINTER_ROLE");
    const BURNER_ROLE = ethers.id("BURNER_ROLE");

    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointAddrIf, 
        signerIf
    );

    const cbdcAddr = await endpointContract.resourceIdToContractAddress(
        resourceIdCBDC
    );

    const realTokenizadoAddr = await endpointContract.resourceIdToContractAddress(
        resourceIdRT
    );

    const RTContract = await ethers.getContractAt(
        RealTokenizadoABI, 
        realTokenizadoAddr, 
        signerIf
    );

    console.log("[DEBUG] Granting MINTER_ROLE & BURNER_ROLE to CBDC's address at RealTokenizado...");
    const txGrantMinter = await RTContract.grantRole(MINTER_ROLE, cbdcAddr);
    await txGrantMinter.wait();

    const txGrantBurner = await RTContract.grantRole(BURNER_ROLE, cbdcAddr);
    await txGrantBurner.wait();
    console.log("[DEBUG] Done.");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });