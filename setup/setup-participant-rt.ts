import { ethers } from "hardhat";
import EndpointV1 from "../abi/EndpointV1.json";
import RealTokenizadoABI from "../abi/RealTokenizado.json";

async function main() {
  const [signerIf] = await ethers.getSigners();

    const endpointAddrIf = process.env.ENDPOINT_ADDR ?? "";
    const resourceIdCBDC = process.env.RESOURCEID_CBDC ?? "";
    const resourceIdRT = ethers.id("RealTokenizado");
    const resourceIdSwap = ethers.id("RealDigitalSwap");

    const MINTER_ROLE = ethers.id("MINTER_ROLE");
    const BURNER_ROLE = ethers.id("BURNER_ROLE");

    const endpointIf = new ethers.Contract(
        endpointAddrIf,
        EndpointV1,
        signerIf
    );

    const cbdcAddr = await endpointIf.resourceIdToContractAddress(resourceIdCBDC);
    const realTokenizadoAddr = await endpointIf.resourceIdToContractAddress(resourceIdRT);
    const swapAddr = await endpointIf.resourceIdToContractAddress(resourceIdSwap);

    const RTContract = new ethers.Contract(
        realTokenizadoAddr,
        RealTokenizadoABI,
        signerIf
    );

    console.log("[DEBUG] Granting MINTER...");
    await (await RTContract.grantRole(MINTER_ROLE, swapAddr)).wait();
    console.log("  swapAddr:", swapAddr);

    await (await RTContract.grantRole(MINTER_ROLE, cbdcAddr)).wait();
    console.log("  cbdcAddr:", cbdcAddr);

    console.log("[DEBUG] Granting BURNER...");
    await (await RTContract.grantRole(BURNER_ROLE, cbdcAddr)).wait();
    console.log("  cbdcAddr:", cbdcAddr);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
