import { ethers } from "hardhat";
import { getPLInformation, getBalanceCBDCSync, getBalanceRTSync, getBalanceTPFTSync } from "../utils/utils";
import IendpointContractABI from "../abi/IEndpoint.json";

async function getBalances() {
    const {
        endpointContractAddr,
        cbdcResourceId,
        tpftResourceId,
        rtResourceId
    } = await getPLInformation();

    const [reservesSigner, clientSigner] = await ethers.getSigners();

    const tpftData =  { 
        acronym: '<acrônimo do título público>', 
        code: '<código do título público>', 
        maturityDate: <data de validade do título público> 
    };

    const reservesAccAddr = reservesSigner.address;
    const clientAccAddr = clientSigner.address;

    const endpointContract = await ethers.getContractAt(
        IendpointContractABI, 
        endpointContractAddr, 
        reservesSigner
    );

    console.log("[DEBUG] Checking RESERVES wallet balances...");
    const balanceCbdcReserves =
      (await getBalanceCBDCSync(
        endpointContract,
        cbdcResourceId,
        reservesSigner,
        reservesAccAddr
      )) ?? BigInt(0);
    console.log("[DEBUG] CBDC reserves account balance:", balanceCbdcReserves);
    
    const balanceRtReserves =
      (await getBalanceRTSync(
        endpointContract,
        rtResourceId,
        reservesSigner,
        reservesAccAddr
      )) ?? BigInt(0);
    console.log("[DEBUG] RealTokenizado reserves account balance:", balanceRtReserves);

    const balancTpftReserves = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        reservesSigner,
        reservesAccAddr, 
        tpftData
    );
    console.log("[DEBUG] TPFt reserves account balance", balancTpftReserves);

    console.log("");
    console.log("[DEBUG] Checking CLIENT wallet balances...");
    const balanceCbdcClient =
      (await getBalanceCBDCSync(
        endpointContract,
        cbdcResourceId,
        clientSigner,
        clientAccAddr
      )) ?? BigInt(0);
    console.log("[DEBUG] CBDC client account balance:", balanceCbdcClient);
    
    const balanceRtClient =
      (await getBalanceRTSync(
        endpointContract,
        rtResourceId,
        clientSigner,
        clientAccAddr
      )) ?? BigInt(0);
    console.log("[DEBUG] RealTokenizado client account balance:", balanceRtClient);

    const balanceTpftClient = await getBalanceTPFTSync(
        endpointContract, 
        tpftResourceId, 
        clientSigner,
        clientAccAddr,
        tpftData
    );
    console.log("[DEBUG] TPFt client account balance", balanceTpftClient);

}

getBalances()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });  

