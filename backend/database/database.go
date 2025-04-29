package database

import (
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

const (
	host     = "localhost"  
	port     = 5432         
	user     = "postgres"     
	password = "12345" 
	dbname   = "lifeskill" 
)

var DB *gorm.DB

func ConnectDatabase() {
	
	// Connection string
	dsn := fmt.Sprintf("host=%s port=%d user=%s "+
	"password=%s dbname=%s sslmode=disable",
	host, port, user, password, dbname)

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
		  SlowThreshold: time.Second,  // Show SQL threshold
		  LogLevel:      logger.Info,  // Log level
		  Colorful:      true,         // Enable color
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
