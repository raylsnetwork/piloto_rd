import { ethers } from "hardhat";
import {
  getBalanceCBDCSync,
  getPLInformation,
  TimeoutExecution
} from "../utils/utils";
import IendpointContractABI from "../abi/EndpointV1.json";
import CbdcABI from "../abi/CBDC.json";
import { Log } from "ethers";

interface TypedEventLog extends Log {
  args: {
    _reqNonce: bigint;
  };
}

async function example2() {
  const {
    endpointContractAddr,
    cbdcResourceId,
    wdResourceId,
    deployerSigner
  } = await getPLInformation();

  //const [deployerSigner] = await ethers.getSigners();

  const chainIdDestination = Number(process.env.DEST_CHAINID ?? 0);
  const destinationWd = process.env.DEST_RESERVES_ACC ?? "";

  const amountRequested = ethers.parseUnits("1000", 2);

  // instanciando Endpoint diretamente com ABI e endereço
  const endpointContract = new ethers.Contract(
    endpointContractAddr,
    IendpointContractABI,
    deployerSigner
  );

  const walletDefault = await endpointContract.getAddressByResourceId(
    wdResourceId
  );
  const cbdcContractAddr = await endpointContract.getAddressByResourceId(
    cbdcResourceId
  );

  // instanciando CBDC diretamente com ABI e endereço
  const cbdcContract = new ethers.Contract(
    cbdcContractAddr,
    CbdcABI,
    deployerSigner
  );

  console.log("[DEBUG] Checking balance at ORIGIN before...");
  const balanceBefore =
    (await getBalanceCBDCSync(
      endpointContract,
      cbdcResourceId,
      deployerSigner,
      walletDefault
    )) ?? BigInt(0);
  console.log("[DEBUG] balanceBefore:", balanceBefore);

  console.log("[DEBUG] Invoking teleportAtomic...");
  const txAtomic = await cbdcContract.crossTransfer(
    [destinationWd],
    [amountRequested],
    [chainIdDestination],
    [[]]
  );
  await txAtomic.wait();

  const balanceAfter =
    (await getBalanceCBDCSync(
      endpointContract,
      cbdcResourceId,
      deployerSigner,
      walletDefault
    )) ?? BigInt(0);
  console.log("[DEBUG] balanceAfter:", balanceAfter);
}

example2()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
