package main

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v4"
)

// GetJWTVerificationKey returns the key used to verify JWT tokens based on the format of the secret
func GetJWTVerificationKey() interface{} {
	// Get the JWT secret from the environment
	jwtSecret := os.Getenv("CASDOOR_JWT_SECRET")
	if jwtSecret == "" {
		log.Println("Warning: CASDOOR_JWT_SECRET environment variable is not set")
		return nil
	}

	// Log the secret length for debugging
	log.Printf("JWT secret length: %d bytes", len(jwtSecret))

	// Check if the secret is in PEM format
	if strings.Contains(jwtSecret, "-----BEGIN") {
		return parseRSAPublicKeyFromPEM([]byte(jwtSecret))
	}

	// If the secret might be base64 encoded, try to decode it
	if isPossiblyBase64(jwtSecret) {
		decoded, err := base64.StdEncoding.DecodeString(jwtSecret)
		if err == nil && strings.Contains(string(decoded), "-----BEGIN") {
			return parseRSAPublicKeyFromPEM(decoded)
		}
	}

	// If it's not a PEM key, return it as a simple HMAC secret
	return []byte(jwtSecret)
}

// parseRSAPublicKeyFromPEM attempts to parse a PEM encoded RSA public key
func parseRSAPublicKeyFromPEM(pemBytes []byte) interface{} {
	block, _ := pem.Decode(pemBytes)
	if block == nil {
		log.Println("Failed to decode PEM block containing public key")
		return nil
	}

	if block.Type == "RSA PUBLIC KEY" {
		// Try parsing as PKCS1 public key
		key, err := x509.ParsePKCS1PublicKey(block.Bytes)
		if err == nil {
			return key
		}
		log.Printf("Failed to parse public key as PKCS1: %v", err)
	}

	// Try parsing as PKIX public key
	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		log.Printf("Failed to parse public key: %v", err)
		return nil
	}

	switch pub := pub.(type) {
	case *rsa.PublicKey:
		return pub
	default:
		log.Printf("Public key is not of type RSA")
		return nil
	}
}

// VerifyJWT verifies a JWT token with the given secret, handling different key formats
func VerifyJWT(tokenString string) (map[string]interface{}, error) {
	verificationKey := GetJWTVerificationKey()
	if verificationKey == nil {
		return nil, fmt.Errorf("no verification key available")
	}

	// Try to parse and verify the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Check the signing method
		switch token.Method.(type) {
		case *jwt.SigningMethodRSA:
			// For RSA, we need an RSA public key
			if rsaKey, ok := verificationKey.(*rsa.PublicKey); ok {
				return rsaKey, nil
			}
			return nil, fmt.Errorf("RSA key required for RSA signing method")
		case *jwt.SigningMethodHMAC:
			// For HMAC, we need a byte slice
			if hmacKey, ok := verificationKey.([]byte); ok {
				return hmacKey, nil
			}
			return nil, fmt.Errorf("byte slice required for HMAC signing method")
		default:
			return nil, fmt.Errorf("unexpected signing method: %v", token.Method)
		}
	})

	if err != nil {
		return nil, err
	}

	// Extract claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// isPossiblyBase64 checks if a string might be base64 encoded
func isPossiblyBase64(s string) bool {
	_, err := base64.StdEncoding.DecodeString(s)
	return err == nil
}