package database

import (
	"gorm.io/gorm"
	
	"golang.org/x/crypto/bcrypt"
	"github.com/gofiber/fiber/v2"
	
)

type User struct {
	gorm.Model
    UserID   uint   `gorm:"primaryKey;autoIncrement" json:"user_id"`
    Username string `gorm:"size:50;not null;unique" json:"username"`
    Password string `gorm:"size:255;not null" json:"password"`
    Email    string `gorm:"size:100;not null;unique" json:"email"`
    Age      int    `json:"age"`
    Sex      string `gorm:"size:10" json:"sex"`
}

func CreateUser(db *gorm.DB, c *fiber.Ctx) error {
	user := new(User)
	if err := c.BodyParser(user); err != nil {
	  return err
	}
  
	// Encrypt the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
	  return err
	}
	user.Password = string(hashedPassword)
  
	// Create user
	db.Create(user)
	return c.JSON(user)
}

