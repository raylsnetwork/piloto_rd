package main

import (
	"bytes"
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"os"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

type Input struct {
	CcRpcUrl           string `json:"cc_rpc_url"`
	CcPlStorageAddress string `json:"cc_plstorage_address"`
	DestinationABIPath string `json:"destination_abi_path"`
	BlockRange         int64  `json:"block_range"`
	PublicKey          string `json:"public_key"`
	PrivateKey         string `json:"secret_key"`
}

type BridgeTransactionType int

type Erc20Metadata struct {
	Amount *big.Int
}

type NewResourceMetadata struct {
	Valid              bool
	ResourceDeployType uint8
	Bytecode           []byte
	FactoryTemplate    uint8
	InitializerParams  []byte
}

type RaylsMessageMetadata struct {
	Valid                     bool
	Nonce                     *big.Int
	NewResourceMetadata       NewResourceMetadata
	ResourceId                [32]byte
	LockData                  []byte
	RevertPayloadDataSender   []byte
	RevertPayloadDataReceiver []byte
	Erc20Metadata             Erc20Metadata
	IgnoresNonce              bool
}

type RaylsMessage struct {
	MessageMetadata RaylsMessageMetadata
	Payload         []byte
}

type DispatchedMessageToCommitChain struct {
	MessageId   [32]byte       `json:"message_id"`
	From        common.Address `json:"from"`
	ToChainId   *big.Int       `json:"to_chain_id"`
	To          common.Address `json:"to"`
	Data        RaylsMessage   `json:"data"`
	FromChainId *big.Int       `json:"from_chain_id"`
	SharedId    string         `json:"shared_id"`
	// proofs
	Proofs          []byte                `json:"proofs"`
	TxTrieProof     common.Hash           `json:"tx_trie_proof"`
	BlockHash       common.Hash           `json:"block_hash"`
	TxLocation      int                   `json:"tx_location"`
	TransactionType BridgeTransactionType `json:"transaction_type"`
	TxHash          common.Hash           `json:"tx_hash"`
}

func main() {
	inputFile, err := os.Open("config.json")

	if err != nil {
		fmt.Println("config.json not found")
	}

	inputFileData := Input{}

	inputFileJsonParser := json.NewDecoder(inputFile)
	if err = inputFileJsonParser.Decode(&inputFileData); err != nil {
		fmt.Println("Error decoding")
	}

	rpcURL := inputFileData.CcRpcUrl
	contractAddress := common.HexToAddress(inputFileData.CcPlStorageAddress)

	PLStorageABI, err := loadABI("ABI/PLStorage.json")
	if err != nil {
		fmt.Println(err)
	}

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}

	privateKey := ImportSecretKey(inputFileData.PrivateKey)

	pubKey := ImportPublicKey(inputFileData.PublicKey)
	outPublic := make([]byte, PublicKeySize)
	pubKey.Export(outPublic)

	sharedKey := CSIDHKX(privateKey, pubKey)

	fmt.Println("Retrieving last", inputFileData.BlockRange, "blocks and processing...")

	blockNumber, err := client.BlockNumber(context.Background())
	if err != nil {
		log.Fatalf("Failed to retrieve the latest block number: %v", err)
	}

	startBlock := big.NewInt(int64(blockNumber) - int64(inputFileData.BlockRange))
	endBlock := big.NewInt(int64(blockNumber))

	fmt.Println("Blocks ranging from number", startBlock, "to", endBlock)

	endContractAbiJson, err := loadABI("ABI/DestinationABI.json")
	if err != nil {
		fmt.Println(err)
	}

	decriptionCounter := 0

	// =========== Entering block / transaction / logs loops ===========
	for i := startBlock; i.Cmp(endBlock) <= 0; i.Add(i, big.NewInt(1)) {

		block, err := client.BlockByNumber(context.Background(), i)
		if err != nil {
			log.Fatalf("Failed to retrieve block %d: %v", i.Int64(), err)
		}

		for _, tx := range block.Transactions() {
			if tx.To() != nil && bytes.Equal(tx.To().Bytes(), contractAddress.Bytes()) {
				receipt, err := client.TransactionReceipt(context.Background(), tx.Hash())
				if err != nil {
					log.Fatalf("Failed to retrieve transaction receipt: %v", err)
				}

				var encryptedMsg string
				for _, log := range receipt.Logs {
					ddd, err := PLStorageABI.Unpack("EncryptedDataStored", hexMustDecode(hex.EncodeToString(log.Data)))
					if err != nil {
						fmt.Println(err)
					}

					encryptedMsg = ddd[1].(string)

					decMsg, err := hex.DecodeString(encryptedMsg)
					if err != nil {
						fmt.Println(err)
					}

					_, unencryptedCtxt := DecryptGCM(decMsg, HashIt(sharedKey[:32]))
					
					if len(unencryptedCtxt) != 0 {
						var ccMessage DispatchedMessageToCommitChain
						err = json.Unmarshal(unencryptedCtxt, &ccMessage)
						if err != nil {
							fmt.Println(err)
						}

						decodedFinalData, method, err := decodeData(hex.EncodeToString(ccMessage.Data.Payload), endContractAbiJson)
						if err != nil {
							fmt.Println(err)
						}

						fmt.Println("ccMessage.Data.Payload: ", hex.EncodeToString(ccMessage.Data.Payload))

						fmt.Println("")
						fmt.Println("Message Successfully decrypted and decoded...")
						fmt.Println("Block Number:", block.Number().Uint64())
						fmt.Println("Transaction Hash:", tx.Hash())
						fmt.Println("Unix Timestamp:", block.Time())
						fmt.Println("")
						fmt.Printf("Function Signature:\n")
						fmt.Printf("%s", method.Sig)
						fmt.Println("")
						fmt.Println("")
						fmt.Printf("Parameter Names and Types:\n")
						fmt.Printf("%s", formatParamNames(method.Inputs))
						fmt.Println("")
						fmt.Println("")
						fmt.Printf("Decoded Input Arguments:\n")
						fmt.Printf("%s", formatDecodedData(decodedFinalData))
						fmt.Println("")
						fmt.Println("")
						fmt.Println("---------------------------------------------")

						decriptionCounter++
					}
				}

			}
		}
	}
	fmt.Println("Using the following keys...")
	fmt.Println("Secret Key:", inputFileData.PrivateKey)
	fmt.Println("Public Key:", inputFileData.PublicKey)
	if decriptionCounter > 0 {
		fmt.Println("Successfully decrypted and decoded a total of", decriptionCounter, "messages.")
	} else {
		fmt.Println("Not able to decrypt and decode any message... Decryption failed!")
	}
}

func hexMustDecode(hexString string) []byte {
	decoded, err := hex.DecodeString(strings.TrimPrefix(hexString, "0x"))
	if err != nil {
		log.Fatal(err)
	}
	return decoded
}

func loadABI(filename string) (*abi.ABI, error) {
	abiJSON, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	var abiData abi.ABI
	err = json.Unmarshal(abiJSON, &abiData)
	if err != nil {
		return nil, err
	}

	return &abiData, nil
}

func formatParamNames(inputs abi.Arguments) string {
	var paramNames []string
	for _, input := range inputs {
		paramNames = append(paramNames, fmt.Sprintf("%s %s", input.Name, input.Type.String()))
	}
	return strings.Join(paramNames, ", ")
}

func formatDecodedData(decodedData map[string]interface{}) string {
	var dataStrings []string
	for key, value := range decodedData {
		dataStrings = append(dataStrings, fmt.Sprintf("%s:%v", key, value))
	}
	return strings.Join(dataStrings, "\n")
}

func decodeData(hexEncodedData string, abiData *abi.ABI) (map[string]interface{}, abi.Method, error) {
	data, err := hex.DecodeString(hexEncodedData)
	if err != nil {
		return nil, abi.Method{}, err
	}

	var method abi.Method
	for _, m := range abiData.Methods {
		if hex.EncodeToString(m.ID) == hexEncodedData[:8] {
			method = m
			break
		}
	}

	unpackedData, err := method.Inputs.UnpackValues(data[4:])
	if err != nil {
		return nil, abi.Method{}, err
	}

	decodedData := make(map[string]interface{})
	for i, input := range method.Inputs {
		decodedData[input.Name] = unpackedData[i]
	}

	return decodedData, method, nil
}
