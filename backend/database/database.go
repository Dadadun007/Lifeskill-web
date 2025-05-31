package database

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	host     = getEnv("DB_HOST", "localhost")
	port     = getEnvAsInt("DB_PORT", 5432)
	user     = getEnv("DB_USER", "postgres")
	password = getEnv("DB_PASSWORD", "12345")
	dbname   = getEnv("DB_NAME", "lifeskill")
)

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}
	return value
}

var DB *gorm.DB

func ConnectDatabase() {
	// Connection string
	dsn := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold: time.Second,
			LogLevel:      logger.Info,
			Colorful:      true,
		},
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})

	if err != nil {
		panic("failed to connect to database")
	}

	// Initialize GORM
	DB.AutoMigrate(
		&User{},
		&Post{},
		&Category{},
		&PostCategory{},
		&UserExpertCategory{},
		&TotalAchievement{},
		&PostApproval{},
		&Comment{},
		&PostLike{},
	)

	// many to many relationship
	DB.SetupJoinTable(&Post{}, "PostCategories", &PostCategory{})
	DB.SetupJoinTable(&User{}, "ExpertCategories", &UserExpertCategory{})
	DB.SetupJoinTable(&User{}, "TotalAchievement", &TotalAchievement{})
	DB.SetupJoinTable(&Post{}, "PostApproval", &PostApproval{})
	DB.SetupJoinTable(&Post{}, "PostLike", &PostLike{})

	fmt.Println("Database migration completed!")
	fmt.Println("Database connection established successfully!")
}
