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
	DB.AutoMigrate(&User{})
	// table อื่น ๆ ต่ออีก

	fmt.Println("Database migration completed!")
	fmt.Println("Database connection established successfully!")
}
