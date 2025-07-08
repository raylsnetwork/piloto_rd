import { ethers } from "hardhat";
import EndpointV1 from "../abi/EndpointV1.json";
import STRABI from "../abi/STR.json";
import STRBytecode from "../bytecode/STR.json";
import RealDigitalSwapABI from "../abi/RealDigitalSwap.json";
import RealDigitalSwapBytecode from "../bytecode/RealDigitalSwap.json";
import RealTokenizadoABI from "../abi/RealTokenizado.json";
import RealTokenizadoBytecode from "../bytecode/RealTokenizado.json";
import { getPLInformation } from "../utils/utils";

async function main() {
  const [signerIf] = await ethers.getSigners();

  const endpointAddrIf = process.env.ENDPOINT_ADDR ?? "";
  const chainIdBacen = process.env.CHAINID_BACEN ?? "";

  const {
    cbdcResourceId,
    strResourceId,
    wdResourceId,
    rtResourceId,
    swapResourceId
  } = await getPLInformation();

  const endpointIf = new ethers.Contract(
    endpointAddrIf,
    EndpointV1,
    signerIf
  );

  console.log("[DEBUG] Registrando Wallet Default...");
  await (await endpointIf.registerResourceId(wdResourceId, signerIf.address)).wait();

  console.log("[DEBUG] Deploy STR...");
  const strFactory = new ethers.ContractFactory(
    STRABI,
    STRBytecode,
    signerIf
  );
  const str = await strFactory.deploy(
    endpointAddrIf,
    chainIdBacen,
    cbdcResourceId,
    wdResourceId
  );
  await str.waitForDeployment();
  console.log("[DEBUG] STR em:", str.target);
  await (await endpointIf.registerResourceId(strResourceId, str.target)).wait();

  console.log("[DEBUG] Deploy RealDigitalSwap...");
  const swapFactory = new ethers.ContractFactory(
    RealDigitalSwapABI,
    RealDigitalSwapBytecode,
    signerIf
  );
  const swap = await swapFactory.deploy(
    endpointAddrIf,
    cbdcResourceId,
    rtResourceId,
    swapResourceId,
    wdResourceId
  );
  await swap.waitForDeployment();
  console.log("[DEBUG] RealDigitalSwap em:", swap.target);
  await (await endpointIf.registerResourceId(swapResourceId, swap.target)).wait();

  console.log("[DEBUG] Deploy RealTokenizado...");
  const rtFactory = new ethers.ContractFactory(
    RealTokenizadoABI,
    RealTokenizadoBytecode,
    signerIf
  );
  const rt = await rtFactory.deploy(
    "RealTokenizado",
    "R$"
  );
  await rt.waitForDeployment();
  console.log("[DEBUG] RealTokenizado em:", rt.target);
  await (await endpointIf.registerResourceId(rtResourceId, rt.target)).wait();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
