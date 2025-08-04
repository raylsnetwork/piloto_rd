import { ethers } from "hardhat";
import {
  getPLInformation,
  getBalanceCBDCSync,
} from "../utils/utils";
import EndpointV1Abi from "../abi/EndpointV1.json";
import CbdcAbi from "../abi/CBDC.json";

async function example1() {
  const CBDC_AMOUNT = BigInt("1000000000000"); // 1 MM (6 decimais)
        
  const { 
      deployerSigner,
      endpointContractAddr, 
      cbdcResourceId,
  } = await getPLInformation();

  
  const destChainId = Number(process.env.DEST_CHAINID ?? 0);
  const destWalletDefault = process.env.DEST_RESERVES_ACC ?? "";

  // Tentando instanciar os endpoints
  console.log({ 
      deployerSigner,
      endpointContractAddr, 
      chainIdIfA: destChainId, 
      destWalletDefault, 
      cbdcResourceId
  });

  const endpointContract = new ethers.Contract(endpointContractAddr, EndpointV1Abi, deployerSigner);

  // Descobrir Wallets Default
  const walletDefault = await endpointContract.getAddressByResourceId(ethers.id("WalletDefault"));
  
  // CBDC
  const cbdcAddress = await endpointContract.getAddressByResourceId(cbdcResourceId);
  const CBDC = new ethers.Contract(cbdcAddress, CbdcAbi, deployerSigner);

  // Checando saldos na ORIGEM e DESTINO antes de invocar o crossTransfer
  console.log("\n[DEBUG] Checando balance na origem antes...");
  const balanceBefore = await getBalanceCBDCSync(
      endpointContract, 
      cbdcResourceId, 
      deployerSigner, 
      walletDefault
  ) ?? BigInt(0);
  console.log("[DEBUG] balanceBefore:", balanceBefore);

  console.log("\n[DEBUG] Invoking crossTransfer to IFA...");
  const txCrossTransfer = await CBDC.crossTransfer(
      [destWalletDefault], [CBDC_AMOUNT], [destChainId], [[]], {gasLimit: 5000000}
  );
  const recipeTx = await txCrossTransfer.wait();

  // Checando saldo na ORIGEM depois de invocar o crossTransfer
  const balanceAfter = await getBalanceCBDCSync(
      endpointContract, 
      cbdcResourceId, 
      deployerSigner, 
      walletDefault
  ) ?? BigInt(0);
  console.log("[DEBUG] balanceAfter:", balanceAfter);
}

example1()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
