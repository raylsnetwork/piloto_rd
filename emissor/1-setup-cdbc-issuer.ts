// setup-issuers.ts

import { ethers } from "hardhat";
import { DecodedError, ErrorDecoder } from "ethers-decode-error";
// import TokenRegistry from "../dependencies/TokenRegistry.json";
import DeploymentProxyRegistryAbi from "../abi/DeploymentProxyRegistry.json";
import TokenRegistryV1Abi from "../abi/TokenRegistryV1.json";
import EndpointV1Abi from "../abi/EndpointV1.json";
import ParticipantStorageReplicaV1Abi from "../abi/ParticipantStorageReplicaV1.json";
import CbdcAbi from "../abi/CBDC.json";
import CbdcBytecode from "../bytecode/CBDC.json";
// import cdbcArtifact from "../artifacts/contracts/CBDC.sol/CBDC.json";


import * as fs from 'fs';
import { logWithReplacement } from "../utils/utils";
// import { logWithReplacement } from "../test/base/baseTest";

function _jsonBigIntParser(
  _: string, 
  v: any
) {
  return typeof v === "bigint" ? v.toString() : v;
}

const gasLimit = 5000000;
const singleResolveSleepTime = 20000;
let tx: any;

export function updateEnv(
    key: string, 
    value: string, 
    forceQuotes=true, 
    addIfNotExists=true
): void {
    const envFilePath = '.env';
    const envVars = fs.readFileSync(envFilePath, 'utf-8').split('\n');
    let founded = false

    const updatedEnvVars = envVars.map((line) => {
        const [k, ...vParts] = line.split('=');
        const v = vParts.join('=');

        if (k.trim() === key) {
            founded=true
            return `${k}=\"${value}\"`;
        }

        return line;
    });

    if(!founded  && addIfNotExists)
    {
        updatedEnvVars.push(`${key}=${value}`)
    }

    fs.writeFileSync(envFilePath, updatedEnvVars.join('\n'), 'utf-8');
}

export function incrementTokenName(key: string): string {
    const envFilePath = ".env";
    const envVars = fs.readFileSync(envFilePath, "utf-8").split("\n");
  
    // Find the line for the given key
    const currentLine = envVars.find((line) => line.startsWith(`${key}=`));
  
    if (!currentLine) {
      throw new Error(`Key ${key} not found in .env`);
    }
  
    // Extract the value part of the current line (after the equals sign)
    const valueMatch = currentLine.match(/="([^"]+)"/);
    if (!valueMatch) {
      throw new Error(`Value for ${key} is not properly formatted`);
    }
  
    const currentValue = valueMatch[1];
  
    // Match the trailing number pattern (e.g., "#1") and extract it
    const tokenMatch = currentValue.match(/#(\d+)$/);
    if (!tokenMatch) {
      throw new Error(`No token found in the value of ${key}`);
    }
  
    // Increment the number
    const currentToken = parseInt(tokenMatch[1], 10);
    const newToken = currentToken + 1;
  
    // Replace the old token with the new token
    const newValue = currentValue.replace(/#\d+$/, `#${newToken}`);
  
    // Update the .env variable using updateEnv
    updateEnv(key, newValue);
    return newValue;
  }

export async function getCommitChanData() {

    const rpcUrl = process.env.RPCURL_CC ?? "";
    // const tokenRegistryAddr = process.env.TOKENREGISTRY_ADDR_CC ?? "";
    const privateKey = process.env.PRIVATEKEY_DEPLOYER_CC ?? "";
    let provider = new ethers.JsonRpcProvider(rpcUrl);
    let signer = new ethers.Wallet(privateKey, provider);
    // const tokenRegistry = await getContractInstance(ContractEnum.TOKENREGISTRY, signer, tokenRegistryAddr);
  
    return {
        rpcUrl
        // ,tokenRegistryAddr
        ,privateKey
        ,provider
        ,signer
        // ,tokenRegistry
    }
  }

export const checkIfTokenWasRegistredByContract = async (
    tokenContract:any, 
    tokenRegistryCC: any, 
    printLogs: boolean = false
): Promise<any> => {
    let retry = 0;
    const tokenName = await tokenContract.name();
    const cc = await getCommitChanData();
    return new Promise(resolve => {
        const interval = setInterval(async () => {
            
            retry++;
            if(printLogs) logWithReplacement(`[DEBUG] [DEBUG] Checking token was registred: ${retry}`)
            let tokenRegistry: any;
            const allTokensAtCC = await tokenRegistryCC.getAllTokens();
            // fs.writeFileSync("./all-tokens.json", JSON.stringify(allTokensAtCC, _jsonBigIntParser, 4), 'utf-8');

            
            if (allTokensAtCC) {
                tokenRegistry = allTokensAtCC.find((obj: { name: string; }) => obj.name === tokenName);
            }
            if(tokenRegistry || retry > 120){
                clearInterval(interval);
                if(tokenRegistry){
                  if(printLogs) console.log("\n[DEBUG] Token Resource ID:", tokenRegistry.resourceId);
                  resolve(tokenRegistry);
                }
            }
        }, 1000)
    });
}

async function main() {

    const errorDecoder = ErrorDecoder.create([
        TokenRegistryV1Abi,
        DeploymentProxyRegistryAbi,
        EndpointV1Abi,
        CbdcAbi,
        ParticipantStorageReplicaV1Abi
    ]);

    // Commit Chain
    const rpcUrlCC = process.env.RPCURL_CC ?? "";
    const deploymentProxyRegistryAddress = process.env.COMMITCHAIN_CCDEPLOYMENTPROXYREGISTRY ?? "";
    
    const privateKeyCC = process.env.PRIVATEKEY_DEPLOYER_CC ?? "";
    let providerCC = new ethers.JsonRpcProvider(rpcUrlCC);
    let signerCC = new ethers.Wallet(privateKeyCC, providerCC);

    // Emissor
    const chainId = process.env.CHAINID ?? "";
    const rpcUrl = process.env.RPCURL ?? "";
    const privateKey = process.env.PRIVATEKEY_DEPLOYER ?? "";
    const endpointAddr = process.env.ENDPOINT_ADDR ?? "";
    let provider = new ethers.JsonRpcProvider(rpcUrl);
    let signer = new ethers.Wallet(privateKey, provider);

    const CDBCName: string = process.env.CBDC_NAME ?? "";
    const CDBCSymbol: string = process.env.CBDC_SYMBOL ?? "";

    // Necessary resource ids
    let cbdcRegistered = undefined;
    let cbdcContractRegistry: any;
    let cbdcResourceId: any;
    let cbdcIssuer: any;

    
    const wdResourceId = ethers.id("WalletDefault");
    const strResourceId = ethers.id("STR");

    console.log("[DEBUG] CHAINID =", chainId, "\n");

    console.log("[DEBUG] Checking if contract has already been deployed with same name");
    const deploymentRegistry = new ethers.Contract(
        deploymentProxyRegistryAddress,
        DeploymentProxyRegistryAbi,
        providerCC
    );

    const endpoint = new ethers.Contract(
        endpointAddr, 
        EndpointV1Abi, 
        signer
    );

    const deployment = await deploymentRegistry.getDeployment();
    const tokenRegistryAddrCC = deployment.tokenRegistryAddress;
    const tokenRegistryCC = new ethers.Contract(
        tokenRegistryAddrCC,
        TokenRegistryV1Abi,
        providerCC
    );
    let allTokensAtCC = await tokenRegistryCC.getAllTokens();
  
    console.log("[DEBUG] allTokensAtCC.map...");
    if (allTokensAtCC) {
        cbdcRegistered = allTokensAtCC.find((obj: { name: string; }) => obj.name === CDBCName);
        if (cbdcRegistered) {
            console.log("[DEBUG] CBDC Contract already deployed and registered");
            console.log("[DEBUG] cbdcContractVenAddress:", cbdcRegistered.issuerImplementationAddress);
            console.log("[DEBUG] cbdcContractVenResourceId:", cbdcRegistered.resourceId);
            cbdcResourceId = cbdcRegistered.resourceId;
        } else {
            console.log("[DEBUG] Deploying CBDC");
            const CBDCFactory = new ethers.ContractFactory(CbdcAbi, CbdcBytecode, signer);
            cbdcIssuer = await CBDCFactory.deploy(
                CDBCName,
                CDBCSymbol,
                endpointAddr
            );
            const txDeploy = await cbdcIssuer.waitForDeployment();
            console.log("  cbdcIssuer.waitForDeployment():");
            console.log("    deploy tx =>", txDeploy.deploymentTransaction()?.hash!);
            console.log("    contract addr =>", cbdcIssuer.target);

            console.log("[DEBUG] submitTokenRegistration");
            tx = await cbdcIssuer.connect(signer).submitTokenRegistration(
                0,
                {gasLimit: gasLimit}
            ); 
            console.log("  cbdcIssuer.submitTokenRegistration =>", (await tx.wait())!.hash);
            console.log("[DEBUG] Waiting submitTokenRegistration Propagation");

            await checkIfTokenWasRegistredByContract(cbdcIssuer, tokenRegistryCC, true)
            console.log();

            allTokensAtCC = await tokenRegistryCC.getAllTokens();
            if (allTokensAtCC) {
                cbdcContractRegistry = allTokensAtCC.find((obj: { name: string; }) => obj.name === CDBCName);
            }

            const tokenByRId = await tokenRegistryCC.getTokenByResourceId(cbdcContractRegistry.resourceId);
            console.log("[DEBUG] tokenByRId:", tokenByRId);

            console.log("[DEBUG] cbdcContractVenAddress:", cbdcContractRegistry.issuerImplementationAddress);
            console.log("[DEBUG] cbdcContractVenResourceId:", cbdcContractRegistry.resourceId);
            console.log("[DEBUG] invoking updateStatus at Commit Chain for CBDC token");
            try {
                tx = await tokenRegistryCC.connect(signerCC)
                    //@ts-ignore    
                    .updateStatus(
                        cbdcContractRegistry.resourceId,
                        1,
                        {gasLimit: gasLimit}
                    );
                await tx.wait();
                cbdcResourceId = cbdcContractRegistry.resourceId;
                updateEnv('RESOURCEID_CBDC', cbdcResourceId);
            } catch (error) {
                const decodedError: DecodedError = await errorDecoder.decode(error);
                console.log(`ERROR: ${decodedError.reason} - ${decodedError.name}`);
                console.log("Trx revert decodedError", decodedError);
                console.log("==============================");
                throw error;
            }

            // Proxy register default wallet
            console.log("\n[DEBUG] Wallet Default...")
            const txRegWd = await endpoint.registerResourceId(wdResourceId, signer.address);
            console.log((await txRegWd.wait()).hash);

            // mint CBDC to default wallet
            console.log("\n[DEBUG] BACEN: CBDC Mint...")
            const INIT_VALUE = BigInt("1000000000000000000000");
            const txMint = await cbdcIssuer.mint(signer.address, INIT_VALUE);
            await txMint.wait(15);
            console.log((await txMint.wait()).hash);
        }
        
        console.log("[DEBUG] Added...");
        console.log("");
        console.log("Here are the new .env variables:");
        console.log("");
        console.log(`RESOURCEID_CBDC="${cbdcResourceId}"`);
        console.log("");
        console.log("(if you want to deploy a new contract, please, change its name at .env)");
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });