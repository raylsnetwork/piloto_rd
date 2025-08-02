import { ethers } from "hardhat";
import EndpointV1 from "../abi/EndpointV1.json";
import STRABI from "../abi/STR.json";
import STRBytecode from "../bytecode/STR.json";
import RealDigitalSwapABI from "../abi/RealDigitalSwap.json";
import RealDigitalSwapBytecode from "../bytecode/RealDigitalSwap.json";
import RealTokenizadoABI from "../abi/RealTokenizado.json";
import RealTokenizadoBytecode from "../bytecode/RealTokenizado.json";
import { getPLInformation } from "../utils/utils";

import TPFTopABI from "../abi/TPFToperation.json";
import TPFTopBytecode from "../bytecode/TPFToperation.json";

async function main() {

  const endpointAddrIf = process.env.ENDPOINT_ADDR ?? "";
  const chainIdBacen = process.env.CHAINID_BACEN ?? "";
  const chainIdSelic = process.env.CHAINID_SELIC ?? "";

  const {
    cbdcResourceId,
    strResourceId,
    wdResourceId,
    rtResourceId,
    swapResourceId,
    dvpContractAddr,
    tpftResourceId,
    dvpResourceId,
    tpftOpResourceId,
    deployerSigner
  } = await getPLInformation();

  const endpointIf = new ethers.Contract(
    endpointAddrIf,
    EndpointV1,
    deployerSigner
  );

  console.log("[DEBUG] Registrando Wallet Default...");
  await (await endpointIf.registerResourceId(wdResourceId, deployerSigner.address)).wait();

  console.log("[DEBUG] Deploy STR...");
  const strFactory = new ethers.ContractFactory(
    STRABI,
    STRBytecode,
    deployerSigner
  );

  console.log({
    endpointAddrIf,
    chainIdBacen,
    cbdcResourceId,
    strResourceId,
    wdResourceId
  })

  const str = await strFactory.deploy(
    endpointAddrIf,
    chainIdBacen,
    cbdcResourceId,
    strResourceId,
    wdResourceId
  );
  await str.waitForDeployment();
  console.log("[DEBUG] STR em:", str.target);
  await (await endpointIf.registerResourceId(strResourceId, str.target)).wait();

  console.log("[DEBUG] Deploy RealDigitalSwap...");
  const swapFactory = new ethers.ContractFactory(
    RealDigitalSwapABI,
    RealDigitalSwapBytecode,
    deployerSigner
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
    deployerSigner
  );
  const rt = await rtFactory.deploy(
    "RealTokenizado",
    "R$"
  );
  await rt.waitForDeployment();
  console.log("[DEBUG] RealTokenizado em:", rt.target);
  await (await endpointIf.registerResourceId(rtResourceId, rt.target)).wait();


  // Deploy e registro do contrato DVP
  console.log("[DEBUG] Deploying and registering TPFToperation contract ...");
  const tpftOpContractFactory = new ethers.ContractFactory(
      TPFTopABI, 
      TPFTopBytecode, 
      deployerSigner
  );
  console.log({
    endpointAddrIf, 
      chainIdSelic,
      cbdcResourceId,
      tpftResourceId,
      dvpResourceId,
      rtResourceId,
      dvpContractAddr
  });
  const tpftOpContract = await tpftOpContractFactory.deploy(
      endpointAddrIf, 
      chainIdSelic,
      cbdcResourceId,
      tpftResourceId,
      dvpResourceId,
      rtResourceId,
      dvpContractAddr
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
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
