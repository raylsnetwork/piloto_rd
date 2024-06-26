import { ethers } from "hardhat";

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

    const endpointIf = await ethers.getContractAt(
        "IEndpoint", 
        endpointAddrIf,
        signerIf
    );

    const cbdcAddr = await endpointIf.resourceIdToContractAddress(
        resourceIdCBDC
    );

    const realTokenizadoAddr = await endpointIf.resourceIdToContractAddress(
        resourceIdRT
    );

    const RTContract = await ethers.getContractAt(
        "RealTokenizado", 
        realTokenizadoAddr, 
        signerIf
    );

    const txGrantMinter = await RTContract.grantRole(MINTER_ROLE, cbdcAddr);
    await txGrantMinter.wait();

    const txGrantBurner = await RTContract.grantRole(BURNER_ROLE, cbdcAddr);
    await txGrantBurner.wait();
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });