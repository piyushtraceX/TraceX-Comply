package main

import (
        "crypto/rsa"
        "encoding/base64"
        "encoding/json"
        "fmt"
        "io"
        "log"
        "os"
        "strings"
        "time"

        "github.com/golang-jwt/jwt/v4"
)

// CustomJWTClaims defines the claims structure for Casdoor JWT tokens
type CustomJWTClaims struct {
        Owner     string `json:"owner"`
        Name      string `json:"name"`
        UserId    string `json:"sub"`
        TokenType string `json:"type"`
        // Standard JWT claims
        jwt.RegisteredClaims
}

// ParseJWTWithRSA parses a JWT token using RSA verification with a private key
func ParseJWTWithRSA(tokenString string) (*CustomJWTClaims, error) {
        // Read the private key file
        privateKeyPath := "./private_key.pem"
        privateKeyData, err := os.ReadFile(privateKeyPath)
        if err != nil {
                log.Printf("Error reading private key file: %v", err)
                return nil, fmt.Errorf("failed to read private key: %v", err)
        }

        // Parse the RSA private key
        privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(privateKeyData)
        if err != nil {
                log.Printf("Error parsing private key: %v", err)
                return nil, fmt.Errorf("failed to parse private key: %v", err)
        }

        // Extract the public key from the private key
        publicKey := &privateKey.PublicKey

        // Create a new JWT token parser
        parser := jwt.NewParser()

        // Parse the token with the public key
        token, err := parser.ParseWithClaims(
                tokenString,
                &CustomJWTClaims{},
                func(token *jwt.Token) (interface{}, error) {
                        // Validate the algorithm
                        if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
                                return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
                        }
                        return publicKey, nil
                },
        )

        if err != nil {
                log.Printf("Error parsing JWT token: %v", err)
                return nil, err
        }

        // Extract the claims
        if claims, ok := token.Claims.(*CustomJWTClaims); ok && token.Valid {
                return claims, nil
        }

        return nil, fmt.Errorf("invalid token")
}

// ParseJWTWithCert parses a JWT token using RSA verification with a certificate from Casdoor
func ParseJWTWithCert(tokenString string, certName string) (*CustomJWTClaims, error) {
        // Try to get the certificate from casdoor
        certKey := os.Getenv("CASDOOR_CERT")
        if certKey == "" {
                return nil, fmt.Errorf("casdoor cert not found in environment variable")
        }

        // Split the token to get the header
        parts := strings.Split(tokenString, ".")
        if len(parts) != 3 {
                return nil, fmt.Errorf("invalid token format")
        }

        // Decode the header
        headerJSON, err := base64.RawURLEncoding.DecodeString(parts[0])
        if err != nil {
                return nil, fmt.Errorf("invalid token header: %v", err)
        }

        // Extract the kid from the header
        var header struct {
                Kid string `json:"kid"`
                Alg string `json:"alg"`
        }
        if err := json.Unmarshal(headerJSON, &header); err != nil {
                return nil, fmt.Errorf("failed to parse token header: %v", err)
        }

        // Verify the signature
        token, err := jwt.ParseWithClaims(
                tokenString,
                &CustomJWTClaims{},
                func(token *jwt.Token) (interface{}, error) {
                        // Make sure the signing method is correct
                        if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
                                return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
                        }

                        // Load the public key - in a real implementation you'd use the kid to fetch 
                        // the appropriate public key from a key store or certificate authority
                        publicKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(certKey))
                        if err != nil {
                                return nil, fmt.Errorf("failed to parse public key: %v", err)
                        }

                        return publicKey, nil
                },
        )

        if err != nil {
                return nil, err
        }

        if claims, ok := token.Claims.(*CustomJWTClaims); ok && token.Valid {
                return claims, nil
        }

        return nil, fmt.Errorf("invalid token")
}

// FormatClaims returns a user-friendly string representation of the claims
func FormatClaims(claims *CustomJWTClaims) string {
        return fmt.Sprintf("Subject: %s, Name: %s, Owner: %s, IssuedAt: %s, ExpiresAt: %s",
                claims.Subject,
                claims.Name,
                claims.Owner,
                time.Unix(claims.IssuedAt.Unix(), 0).Format(time.RFC3339),
                time.Unix(claims.ExpiresAt.Unix(), 0).Format(time.RFC3339),
        )
}