package database

import (
	"log"
	"os"
)

var JwtSecretKey []byte

func LoadConfig() {
	secret := os.Getenv("JWT_SECRET")

	if secret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}

	if len(secret) < 32 {
		log.Fatal("JWT_SECRET must be at least 32 characters long")
	}

	JwtSecretKey = []byte(secret)
	log.Printf("JWT Secret Key loaded successfully (length: %d bytes)", len(JwtSecretKey))
}
