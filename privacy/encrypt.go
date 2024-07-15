package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"fmt"

	"golang.org/x/crypto/sha3"
)

// GenerateSecureRandomValue securely generates a random value of size in bytes
func GenerateSecureRandomValue(size int) ([]byte, error) {

	x := make([]byte, size)

	_, err := rand.Read(x)

	if err != nil {
		return nil, err
	}

	return x, nil
}

func HashIt(data []byte) []byte {

	h := sha3.New256()
	h.Write(data)

	return h.Sum(nil)
}

func GetSharedFingerprint(sharedSecret []byte, randomness []byte) []byte {

	h := sha3.New256()
	h.Write(sharedSecret)
	h.Write(randomness)

	return h.Sum(nil)
}

// EncryptGCM encrypts a plaintext message using AES GCM ()
func EncryptGCM(key []byte, plaintext []byte, associatedData []byte) []byte {

	// we use a 32 bytes key (which instantiates AES-256) for quantum security
	if len(key) < 32 {
		key = HashIt(key)
	}

	// Generate a new AES cipher using the given key
	block, err := aes.NewCipher(key)

	if err != nil {
		panic(err)
	}

	// Generate a new GCM cipher
	gcm, err := cipher.NewGCM(block)

	if err != nil {
		panic(err)
	}

	// Generate a new nonce
	nonce, err := GenerateSecureRandomValue(gcm.NonceSize())

	if err != nil {
		panic(err)
	}

	// Seal the plaintext to the nonce and associated data
	ciphertext := gcm.Seal(nil, nonce, plaintext, associatedData)

	// Append associated data and nonce to ciphertext
	nctxt := append(nonce, ciphertext...)
	payload := append(associatedData, nctxt...)

	return payload
}

// DecryptGCM receives a ciphertext and returns the plaintext (and potentially the associated data)
// this ciphertext has the following form: AD (16 bytes) || Nonce (12 bytes) || Encrypted Msg (remainder bytes)
func DecryptGCM(ciphertext []byte, key []byte) ([]byte, []byte) {
	// Generate a new AES cipher using the given key
	block, err := aes.NewCipher(key)

	if err != nil {

		panic(err)
	}

	// Generate a new GCM cipher
	gcm, err := cipher.NewGCM(block)

	if err != nil {
		panic(err)
	}

	// Split associated data, nonce, and ciphertext
	associatedData := ciphertext[0:16]
	nonce := ciphertext[16 : 16+gcm.NonceSize()]
	ctxt := ciphertext[16+gcm.NonceSize():]

	// Open the ciphertext and return the plaintext
	plaintext, err := gcm.Open(nil, nonce, ctxt, associatedData)

	if err != nil {
		fmt.Println("Error decrypting data...", err)
		//os.Exit(0)
	}
	return associatedData, plaintext
}
