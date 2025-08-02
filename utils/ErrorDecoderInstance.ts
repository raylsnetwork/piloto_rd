import { DecodedError, ErrorDecoder } from "ethers-decode-error";
import { ethers } from "hardhat";

import RealDigitalSwapABI from "../abi/RealDigitalSwap.json";
import TPFtABI from "../abi/TPFt.json";
import CBDCABI from "../abi/CBDC.json";
import TPFToperationABI from "../abi/TPFToperation.json";




export async function getErrorDecoderInstance(){
    let tpftOperationABI = ( await ethers.getContractFactory(TPFToperationABI,"")).interface;
    let cbdcABI = (await ethers.getContractFactory(CBDCABI,"")).interface;
    let realDigitalSwapABI = (await ethers.getContractFactory(RealDigitalSwapABI,"")).interface;
    let tpftABI = (await ethers.getContractFactory(TPFtABI,"")).interface;

    const errorDecoder = ErrorDecoder.create([
        tpftOperationABI,
        cbdcABI,
        realDigitalSwapABI,
        tpftABI
    ]);
    return errorDecoder;
}

export async function decodeAndLogTransactionError(errorDecoder: ErrorDecoder, error: unknown) {
    const decodedError: DecodedError = await errorDecoder.decode(error);
    console.log(`ERROR: ${decodedError.reason} - ${decodedError.name}`);
    console.log("Trx revert decodedError", decodedError);
    console.log("==============================");
}