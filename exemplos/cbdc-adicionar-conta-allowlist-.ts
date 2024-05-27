import { ethers } from "hardhat";
import { getPLInformation } from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";
import CbdcABI from "../abi/CBDC.json";

async function AllowListAddition() {
    const {
        endpointContractAddr,
        cbdcResourceId
    } = await getPLInformation();
    
    const [deployerSigner] = await ethers.getSigners();

    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        deployerSigner
    );
    const cbdcContractAddr = await endpointContract.resourceIdToContractAddress(
        cbdcResourceId
    );
    const cbdcContract = await ethers.getContractAt(
        CbdcABI, 
        cbdcContractAddr, 
        deployerSigner
    );

    const arbitraryAcc = "<Endereço do conta>";

    const isAllowedBefore = await cbdcContract.isAddressAllowed(arbitraryAcc);
    console.log(`[DEBUG] Before - isAddressAllowed(${arbitraryAcc}): ${isAllowedBefore}`);
    
    console.log(`[DEBUG] Adding allowance...`);
    const txAllowlist = await cbdcContract.addToAllowlist(arbitraryAcc);
    await txAllowlist.wait();

    const isAllowedAfter = await cbdcContract.isAddressAllowed(arbitraryAcc);
    console.log(`[DEBUG] After - isAddressAllowed(${arbitraryAcc}): ${isAllowedAfter}`);

    await txAllowlist.wait();
}

AllowListAddition()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

