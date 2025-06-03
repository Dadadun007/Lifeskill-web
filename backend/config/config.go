package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	DBHost      string
	DBPort      int
	DBUser      string
	DBPassword  string
	DBName      string
	Port        string
	JWTSecret   string
	FrontendURL string
	UploadDir   string
}

var AppConfig Config

func LoadConfig() {
	// Database Configuration
	AppConfig.DBHost = getEnv("DB_HOST", "localhost")
	AppConfig.DBPort = getEnvAsInt("DB_PORT", 5432)
	AppConfig.DBUser = getEnv("DB_USER", "postgres")
	AppConfig.DBPassword = getEnv("DB_PASSWORD", "12345")
	AppConfig.DBName = getEnv("DB_NAME", "lifeskill")

	// Server Configuration
	AppConfig.Port = getEnv("PORT", "8080")
	AppConfig.FrontendURL = getEnv("FRONTEND_URL", "http://localhost:5173")
	AppConfig.JWTSecret = getEnv("JWT_SECRET", "your_jwt_secret_key_here")
	AppConfig.UploadDir = getEnv("UPLOAD_DIR", "./uploads")
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func GetDSN() string {
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		AppConfig.DBHost,
		AppConfig.DBPort,
		AppConfig.DBUser,
		AppConfig.DBPassword,
		AppConfig.DBName,
	)
}
