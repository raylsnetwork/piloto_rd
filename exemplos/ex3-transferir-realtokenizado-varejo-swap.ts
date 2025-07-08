import { ethers } from "hardhat";
import {
  getBalanceCBDCSync,
  getBalanceRTSync,
  getPLInformation
} from "../utils/utils";
import IendpointContractABI from "../abi/EndpointV1.json";
import RealTokenizadoABI from "../abi/RealTokenizado.json";
import RealDigitalSwapABI from "../abi/RealDigitalSwap.json";

async function example4() {
  const {
    endpointContractAddr,
    cbdcResourceId,
    wdResourceId,
    rtResourceId,
    swapResourceId
  } = await getPLInformation();

  const [deployerSigner, clientSigner] = await ethers.getSigners();

  const chainIdDestination = Number(process.env.DEST_CHAINID ?? 0);
  const destWdAcc = process.env.DEST_RESERVES_ACC ?? "";
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
  const swapContractAddr = await endpointContract.getAddressByResourceId(
    swapResourceId
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

  const swapContract = new ethers.Contract(
    swapContractAddr,
    RealDigitalSwapABI,
    clientSigner
  );

  console.log(
    "[DEBUG] Approving RealTokenizado amount for CBDC contract address..."
  );
  const txApproveRT = await realTokenizadoContract
    .connect(clientSigner)
    .approve(swapContractAddr, amountToMintAndSwap);
  await txApproveRT.wait();

  console.log("[DEBUG] swap ...");
  const txSwap = await swapContract.swap(
    destWdAcc,
    destClientAcc,
    amountToMintAndSwap,
    chainIdDestination
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
