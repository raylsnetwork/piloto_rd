import { ethers } from "hardhat";

import RealTokenizadoABI from "../abi/RealTokenizado.json";
import CbdcABI from "../abi/CBDC.json";

export const timeoutToResolve = 120;

export const RT_NAME: string = process.env.RT_NAME ?? "";
export const RT_SYMBOL: string = process.env.RT_SYMBOL ?? "";

export async function getPLInformation() {
    const cbdcResourceId = process.env.RESOURCEID_CBDC ?? "";
    const dvpContractAddr = process.env.DVP_CONTRACT_ADDR ?? "";

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
    const addressCBDC = await endpointContract.resourceIdToContractAddress(resourceId ?? "");
    if (addressCBDC === ethers.ZeroAddress){
        return undefined;
    }
    const CBDCContract = await ethers.getContractAt(CbdcABI, addressCBDC, signer);
    const balance = await CBDCContract.balanceOf(walletBalance);
    return balance;
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