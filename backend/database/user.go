package database

import (
	"gorm.io/gorm"
	
	"golang.org/x/crypto/bcrypt"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"time"
	
)

type User struct {
	gorm.Model
    Username string `gorm:"size:50;not null;unique" json:"username"`
    Password string `gorm:"size:255;not null" json:"password"`
    Email    string `gorm:"size:100;not null;unique" json:"email"`
    Age      int    `json:"age"`
    Sex      string `gorm:"size:10" json:"sex"`
	Picture  string `gorm:"size:255" json:"picture"`
	Posts    			[]Post 				`gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	ExpertCategories 	[]Category 			`gorm:"many2many:user_expert_categories;"`
	TotalAchievement 	[]TotalAchievement 	`gorm:"many2many:Total_Achievement"`
	PostApproval      	[]PostApproval 		`gorm:"many2many:post_approval;"`
	Comments         	[]Comment         	`gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
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

// loginUser handles user login
func LoginUser(db *gorm.DB, c *fiber.Ctx) error {
	var input User
	var user User
  
	if err := c.BodyParser(&input); err != nil {
	  return err
	}
  
	// Find user by username
	db.Where("email = ?", input.Email).First(&user)
  
	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
	  return c.SendStatus(fiber.StatusUnauthorized)
	}
  
	// Create JWT token
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["user_id"] = user.ID
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()
  
	t, err := token.SignedString(JwtSecretKey)
	if err != nil {
	  return c.SendStatus(fiber.StatusInternalServerError)
	}
  
	// Set cookie
	c.Cookie(&fiber.Cookie{
	  Name:     "jwt",
	  Value:    t,
	  Expires:  time.Now().Add(time.Hour * 72),
	  HTTPOnly: true,
	})
  
	return c.JSON(fiber.Map{"message": "success"})
}