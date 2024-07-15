package main

import (
	"crypto/rand"
	"encoding/hex"
	"errors"

	"github.com/ryndia/circl/dh/csidh"
)

func GenerateCSIDHSecretKey() *csidh.PrivateKey {

	//creating variables
	sk := new(csidh.PrivateKey)

	csidh.GeneratePrivateKey(sk, rand.Reader)

	return sk
}

func CalculateCSIDHPublicKey(sk *csidh.PrivateKey) *csidh.PublicKey {

	pk := new(csidh.PublicKey)

	csidh.GeneratePublicKey(pk, sk, rand.Reader)

	// check that pk is valid
	ok := csidh.Validate(pk, rand.Reader)

	if !ok {
		return nil
	}

	return pk
}

func CSIDHKX(sk *csidh.PrivateKey, pk *csidh.PublicKey) *[64]byte {

	// allocate memory for the shared secret
	s := new([64]byte)

	// check that passed public key is valid
	ok := csidh.Validate(pk, rand.Reader)

	// if public key is not valid, then panic
	if !ok {
		err := errors.New("public key is not valid")
		panic(err.Error())
	}

	// obtain the shared secret
	csidh.DeriveSecret(s, pk, sk, rand.Reader)

	return s
}

const (
	PrivateKeySize = 37
	PublicKeySize  = 64
)

func ImportSecretKey(sk string) *csidh.PrivateKey {

	keyToHex, _ := hex.DecodeString(sk)
	secretKey := new(csidh.PrivateKey)
	secretKey.Import(keyToHex)

	sK := make([]byte, PublicKeySize)
	ok := secretKey.Export(sK)

	// if secret key is not valid, then panic
	if !ok {
		err := errors.New("secret key is not valid")
		panic(err.Error())
	}

	return secretKey
}

func ImportPublicKey(pk string) *csidh.PublicKey {

	pKHex, _ := hex.DecodeString(pk)
	pubKey := new(csidh.PublicKey)
	pubKey.Import(pKHex)

	pKBytes := make([]byte, PublicKeySize)
	ok := pubKey.Export(pKBytes)

	if !ok {
		err := errors.New("public key is not valid")
		panic(err.Error())
	}

	return pubKey
}
