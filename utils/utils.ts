import { ethers } from "hardhat";

import RealTokenizadoABI from "../abi/RealTokenizado.json";
import CbdcABI from "../abi/CBDC.json";
import TpftABI from "../abi/TPFt.json";

export const timeoutToResolve = 120;

export const RT_NAME: string = process.env.RT_NAME ?? "";
export const RT_SYMBOL: string = process.env.RT_SYMBOL ?? "";

export async function getPLInformation() {
    const cbdcResourceId = process.env.RESOURCEID_CBDC ?? "";
    const tpftResourceId = process.env.RESOURCEID_TPFT ?? "";
    const dvpContractAddr = process.env.DVP_CONTRACT_ADDR ?? "";

    const chainId = process.env.CHAINID ?? "";
    const rpcUrl = process.env.RPCURL ?? "";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const endpointContractAddr = process.env.ENDPOINT_ADDR ?? "";
    const deployerPrivateKey = process.env.PRIVATEKEY_DEPLOYER ?? "";
    const deployerSigner = new ethers.Wallet(deployerPrivateKey, provider);
    const clientPrivateKey = process.env.PRIVATEKEY_CLIENT ?? "";
    const clientSigner = new ethers.Wallet(clientPrivateKey, provider);

    const strResourceId = ethers.id("STR" + process.env.ENV_VERSION);
    const wdResourceId = ethers.id("WalletDefault" + process.env.ENV_VERSION);
    const rtResourceId = ethers.id("RealTokenizado" + process.env.ENV_VERSION);
    const dvpResourceId = ethers.id("DVP" + process.env.ENV_VERSION);
    const tpftOpResourceId = ethers.id("TPFToperation" + process.env.ENV_VERSION)

    return {
        chainId,
        provider,
        deployerSigner,
        clientSigner,
        endpointContractAddr,
        cbdcResourceId,
        tpftResourceId,
        strResourceId,
        wdResourceId,
        rtResourceId,
        dvpResourceId,
        tpftOpResourceId,
        dvpContractAddr
    }
}

export async function getBalanceRTSync(endpointContract: any, resourceId: string | undefined, signer: any, walletBalance: string) {
    const addressRT = await endpointContract.resourceIdToContractAddress(resourceId ?? "");
    if (addressRT === ethers.ZeroAddress){
        return undefined;
    }
    const RTIF = await ethers.getContractAt(RealTokenizadoABI, addressRT, signer);
    const balance = await RTIF.balanceOf(walletBalance);
    return balance;
}

export async function getBalanceCBDCSync(endpointContract: any, resourceId: string | undefined, signer: any, walletBalance: string) {
    console.log("[DEBUG] resourceId:", resourceId);
    const addressCBDC = await endpointContract.resourceIdToContractAddress(resourceId ?? "");
    console.log("[DEBUG] addressCBDC.target:", addressCBDC.target);
    if (addressCBDC === ethers.ZeroAddress){
        return undefined;
    }
    const CBDCContract = await ethers.getContractAt(CbdcABI, addressCBDC, signer);
    const balance = await CBDCContract.balanceOf(walletBalance);
    return balance;
}

export async function getBalanceTPFTSync(endpointContract: any, resourceId: string | undefined, signer: any, walletBalance: string, tpftData: { acronym: string, code: string, maturityDate: number }) {
    let tpftAddress = await endpointContract.resourceIdToContractAddress(resourceId ?? "");
    let balanceTPFT = BigInt(0);
    let tpftId = BigInt(0);
    if (tpftAddress != ethers.ZeroAddress) {
        const tpftContractB = await ethers.getContractAt(TpftABI, tpftAddress, signer);
        tpftId = await tpftContractB.getTPFtId(
            tpftData.acronym,
            tpftData.code,
            tpftData.maturityDate
        );
        balanceTPFT = tpftId != BigInt(0) ? await tpftContractB.balanceOf(walletBalance, tpftId) : BigInt(0);
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