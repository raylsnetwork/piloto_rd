import { ethers } from "hardhat";
import {
  getBalanceCBDCSync,
  getBalanceRTSync,
  getPLInformation
} from "../utils/utils";
import IendpointContractABI from "../abi/EndpointV1.json";
import CbdcABI from "../abi/CBDC.json";
import RealTokenizadoABI from "../abi/RealTokenizado.json";
import { Log } from "ethers";

async function example4() {
  const {
    endpointContractAddr,
    cbdcResourceId,
    wdResourceId,
    rtResourceId
  } = await getPLInformation();

  const [deployerSigner, clientSigner] = await ethers.getSigners();

  const chainIdDestination = Number(process.env.DEST_CHAINID ?? 0);
  const destClientAcc = process.env.DEST_CLIENT_ACC ?? "";

  const amountToMintAndSwap = ethers.parseUnits("10", 2);

  const endpointContract = new ethers.Contract(
    endpointContractAddr,
    IendpointContractABI,
    deployerSigner
  );

  const walletDefault = await endpointContract.getAddressByResourceId(
    wdResourceId
  );
  const realTokenizadoAddr = await endpointContract.getAddressByResourceId(
    rtResourceId
  );
  const cbdcContractAddr = await endpointContract.getAddressByResourceId(
    cbdcResourceId
  );

  const realTokenizadoContract = new ethers.Contract(
    realTokenizadoAddr,
    RealTokenizadoABI,
    deployerSigner
  ) as any;
  console.log("[DEBUG] Minting Real Tokenizado for the client at origin...");
  const txMint = await realTokenizadoContract.mint(
    clientSigner.address,
    amountToMintAndSwap
  );
  await txMint.wait();

  const cbdcContract = new ethers.Contract(
    cbdcContractAddr,
    CbdcABI,
    clientSigner
  );

  const balanceRTBefore =
    (await getBalanceRTSync(
      endpointContract,
      rtResourceId,
      clientSigner,
      clientSigner.address
    )) ?? BigInt(0);
  console.log("[DEBUG] balanceRTBefore:", balanceRTBefore);

  const balanceCDBCBefore =
    (await getBalanceCBDCSync(
      endpointContract,
      cbdcResourceId,
      deployerSigner,
      walletDefault
    )) ?? BigInt(0);
  console.log("[DEBUG] balanceCDBCBefore:", balanceCDBCBefore);

  console.log(
    "[DEBUG] Approving RealTokenizado amount for CBDC contract address..."
  );
  const txApproveRT = await realTokenizadoContract
    .connect(clientSigner)
    .approve(cbdcContractAddr, amountToMintAndSwap);
  await txApproveRT.wait();

  console.log("[DEBUG] swap ...");
  const txSwap = await cbdcContract.swap(
    chainIdDestination,
    cbdcResourceId,
    destClientAcc,
    amountToMintAndSwap
  );
  await txSwap.wait();

  const balanceRTAfter =
    (await getBalanceRTSync(
      endpointContract,
      rtResourceId,
      clientSigner,
      clientSigner.address
    )) ?? BigInt(0);
  console.log("[DEBUG] balanceRTAfter:", balanceRTAfter);

  const balanceCDBCAfter =
    (await getBalanceCBDCSync(
      endpointContract,
      cbdcResourceId,
      deployerSigner,
      walletDefault
    )) ?? BigInt(0);
  console.log("[DEBUG] balanceCDBCAfter:", balanceCDBCAfter);
}

example4()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
