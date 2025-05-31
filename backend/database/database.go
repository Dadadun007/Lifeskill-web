package database

import (
	"log"
	"os"
	"time"

	"github.com/dadadun/lifskill/config"
	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB
var JwtSecretKey = []byte(config.AppConfig.JWTSecret)

func ConnectDatabase() {
	// Get DSN from config
	dsn := config.GetDSN()

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold: time.Second, // Show SQL threshold
			LogLevel:      logger.Info, // Log level
			Colorful:      true,        // Enable color
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

	log.Println("Database migration completed!")
	log.Println("Database connection established successfully!")
}
