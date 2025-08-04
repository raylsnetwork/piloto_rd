import { ethers } from "hardhat";
import {
  getPLInformation,
  getBalanceCBDCSync,
  TimeoutExecution,
  logWithReplacement,
} from "../utils/utils";

import IEndpointABI from "../abi/EndpointV1.json";
import StrABI from "../abi/STR.json";

async function example1() {
  const { 
    endpointContractAddr, 
    cbdcResourceId,
    strResourceId,
    wdResourceId,
    deployerSigner
  } = await getPLInformation();

  //const [deployerSigner] = await ethers.getSigners();

  const amountRequested = ethers.parseUnits("3000", 2);

  const endpointContract = await ethers.getContractAt(
    IEndpointABI,
    endpointContractAddr,
    deployerSigner
  );
  const walletDefault = await endpointContract.getAddressByResourceId(wdResourceId);

  console.log("[DEBUG] Checking balance before...");
  let balanceBefore =
    (await getBalanceCBDCSync(
      endpointContract,
      cbdcResourceId,
      deployerSigner,
      walletDefault
    )) ?? BigInt(0);
  console.log("[DEBUG] balanceBefore:", balanceBefore);

  const strAddress = await endpointContract.getAddressByResourceId(strResourceId);
  const strContract = await ethers.getContractAt(
    StrABI,
    strAddress,
    deployerSigner
  );

  console.log("[DEBUG] Invoking requestToTransfer...");
  const txRequestToTransfer = await strContract.requestToTransfer(
    [amountRequested]
  );
  await txRequestToTransfer.wait();
  console.time("Wait balance update.");
  const balanceAfter = await TimeoutExecution(async (retry) => {
    logWithReplacement(`[DEBUG] Waiting CBDC balance to be updated: ${retry}`)
    const balanceCBDC = await getBalanceCBDCSync(
      endpointContract,
      cbdcResourceId,
      deployerSigner,
      walletDefault
    );
    if (balanceCBDC != undefined && balanceCBDC != balanceBefore) {
      return [true, balanceCBDC];
    } else return [false, BigInt(0)];
  });
  console.log();
  console.timeEnd("Wait balance update.");
  console.log("[DEBUG] balanceAfter:", balanceAfter);
}

example1()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
