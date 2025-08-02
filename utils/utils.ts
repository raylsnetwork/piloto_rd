import { ethers } from "hardhat";

import RealTokenizadoABI from "../abi/RealTokenizado.json";
import CbdcABI from "../abi/CBDC.json";
import TPFtABI from "../abi/TPFt.json";

export const timeoutToResolve = 120;

export const RT_NAME: string = process.env.RT_NAME ?? "";
export const RT_SYMBOL: string = process.env.RT_SYMBOL ?? "";

export async function getPLInformation() {
    const cbdcResourceId = process.env.RESOURCEID_CBDC ?? "";
    const dvpContractAddr = process.env.DVP_CLAIM_ADDRESS ?? "";
    const tpftResourceId = process.env.RESOURCEID_TPFT ?? "";

    const chainId = process.env.CHAINID ?? "";
    const rpcUrl = process.env.RPCURL ?? "";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const endpointContractAddr = process.env.ENDPOINT_ADDR ?? "";
    const deployerPrivateKey = process.env.PRIVATEKEY_DEPLOYER ?? "";
    const deployerSigner = new ethers.Wallet(deployerPrivateKey, provider);
    const clientPrivateKey = process.env.PRIVATEKEY_CLIENT ?? "";
    const clientSigner = new ethers.Wallet(clientPrivateKey, provider);

    const strResourceId = ethers.id("STR");
    const wdResourceId = ethers.id("WalletDefault");
    const rtResourceId = ethers.id("RealTokenizado");
    const swapResourceId = ethers.id("RealDigitalSwap");
    const dvpResourceId = ethers.id("DVP");
    const tpftOpResourceId = ethers.id("TPFToperation");

    return {
        chainId,
        provider,
        deployerSigner,
        clientSigner,
        endpointContractAddr,
        cbdcResourceId,
        strResourceId,
        wdResourceId,
        rtResourceId,
        swapResourceId,
        dvpContractAddr,
        tpftResourceId,
        dvpResourceId,
        tpftOpResourceId
    }
}

export async function getBalanceRTSync(endpointContract: any, resourceId: string | undefined, signer: any, walletBalance: string) {
    const addressRT = await endpointContract.getAddressByResourceId(resourceId ?? "");
    if (addressRT === ethers.ZeroAddress){
        return undefined;
    }
    const RTIF = await ethers.getContractAt(RealTokenizadoABI, addressRT, signer);
    const balance = await RTIF.balanceOf(walletBalance);
    return balance;
}

export async function getBalanceCBDCSync(endpointContract: any, resourceId: string | undefined, signer: any, walletBalance: string) {
    const addressCBDC = await endpointContract.getAddressByResourceId(resourceId ?? "");
    if (addressCBDC === ethers.ZeroAddress){
        return undefined;
    }
    const CBDCContract = await ethers.getContractAt(CbdcABI, addressCBDC, signer);
    const balance = await CBDCContract.balanceOf(walletBalance);
    return balance;
}

export async function getBalanceTPFTSync(endpointContract: any, resourceId: string | undefined, signer: any, walletBalance: string, tpftData: { acronym: string, code: string, maturityDate: number }) {
    let tpftAddress = await endpointContract.getAddressByResourceId(resourceId ?? "");

    // Checando saldo de TPFt no SELLER
    let balanceTPFT = BigInt(0);
    let tpftIdIFB = BigInt(0);
    if (tpftAddress != ethers.ZeroAddress) {
        const tpftContractB = await ethers.getContractAt(TPFtABI, tpftAddress, signer);
        tpftIdIFB = await tpftContractB.getTPFtId(
            tpftData.acronym,
            tpftData.code,
            tpftData.maturityDate
        );
        // expect(tpftIdIFB).not.eq(0);
        balanceTPFT = tpftIdIFB != BigInt(0) ? await tpftContractB.balanceOf(walletBalance, tpftIdIFB) : BigInt(0);
    }
    return balanceTPFT;
}

export async function TimeoutExecution(execution: (retry:number) => Promise<[boolean, any]>) {
    return new Promise(resolve => {
        let retry = 0;
        const intervalPromise = setInterval(async () => {
            retry++;
            const [finish, result] = await execution(retry);
            if (finish || retry > timeoutToResolve) {
                clearInterval(intervalPromise);
                resolve(result);
            }
        }, 1000)
    });

}

export const logWithReplacement = (message: string) => {
    process.stdout.write('\r');  // Move the cursor to the beginning of the line
    process.stdout.write(message);
}