import { ethers } from "hardhat";
import EndpointV1 from "../abi/EndpointV1.json";
import RealTokenizadoABI from "../abi/RealTokenizado.json";
import { getPLInformation } from "../utils/utils";

async function main() {
  const [signerIf] = await ethers.getSigners();

    const { 
        endpointContractAddr, 
        cbdcResourceId,
        rtResourceId,
        swapResourceId
      } = await getPLInformation();

    const MINTER_ROLE = ethers.id("MINTER_ROLE");
    const BURNER_ROLE = ethers.id("BURNER_ROLE");

    const endpointIf = new ethers.Contract(
        endpointContractAddr,
        EndpointV1,
        signerIf
    );

    const cbdcAddr = await endpointIf.resourceIdToContractAddress(cbdcResourceId);
    const realTokenizadoAddr = await endpointIf.resourceIdToContractAddress(rtResourceId);
    const swapAddr = await endpointIf.resourceIdToContractAddress(swapResourceId);

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
