package database

import (
	"crypto/rand"
	"encoding/base64"
	"log"
	"os"
)

var JwtSecretKey []byte

func LoadConfig() {
	secret := os.Getenv("JWT_SECRET")

	if secret == "" {
		log.Println("JWT_SECRET not set, generating random secret for this session...")

		randomSecret := make([]byte, 32) // 256-bit key
		_, err := rand.Read(randomSecret)
		if err != nil {
			log.Fatal("Failed to generate secret:", err)
		}

		// Optionally: print it in base64 for debugging or reuse.
		log.Println("Generated JWT secret:", base64.StdEncoding.EncodeToString(randomSecret))

		JwtSecretKey = randomSecret
		return
	}

	JwtSecretKey = []byte(secret)
}
