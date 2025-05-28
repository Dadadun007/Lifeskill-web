package database

import (
	"log"
	"os"
)

var JwtSecretKey []byte

func LoadConfig() {
	secret := os.Getenv("JWT_SECRET")

	if secret == "" {
		log.Println("JWT_SECRET not set, using default secret key...")
		// Use a more secure default key
		secret = "lifeskill-secure-jwt-secret-key-2024"
		log.Printf("Using secret key: %s", secret)
	}

	JwtSecretKey = []byte(secret)
	log.Printf("JWT Secret Key length: %d bytes", len(JwtSecretKey))
}
