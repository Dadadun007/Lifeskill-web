package database

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username         string             `gorm:"size:50;not null;unique" json:"username"`
	Password         string             `gorm:"size:255;not null" json:"password"`
	Email            string             `gorm:"size:100;not null;unique" json:"email"`
	Age              int                `json:"age"`
	Sex              string             `gorm:"size:10" json:"sex"`
	Picture          string             `gorm:"size:255" json:"picture"`
	Posts            []Post             `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	ExpertCategories []Category         `gorm:"many2many:user_expert_categories;"`
	TotalAchievement []TotalAchievement `gorm:"many2many:Total_Achievement"`
	PostApproval     []PostApproval     `gorm:"many2many:post_approval;"`
	Comments         []Comment          `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
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

	// Find user by email
	if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	// Create JWT token with StandardClaims
	claims := jwt.StandardClaims{
		Subject:   strconv.Itoa(int(user.ID)), // ใช้ userID เป็น Subject
		ExpiresAt: time.Now().Add(72 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	t, err := token.SignedString(JwtSecretKey)
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	// Set JWT token in cookie
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    t,
		Expires:  time.Now().Add(72 * time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
		Secure:   true,
	})

	return c.JSON(fiber.Map{"message": "success"})
}

func UpdateUser(db *gorm.DB, c *fiber.Ctx) error {
	// Get the current user ID from JWT
	userID := c.Locals("userID").(uint)

	// Find the user by ID
	var user User
	if err := db.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Parse the incoming data
	var input struct {
		Username          string `form:"username"`
		Email             string `form:"email"`
		Age               int    `form:"age"`
		Gender            string `form:"gender"`
		ExpertCategoryIDs []uint `form:"expertCategoryIDs"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input data",
		})
	}

	// Check uploaded file (optional)
	file, err := c.FormFile("picture")
	if err == nil && file != nil {
		// Save the uploaded file
		filePath := fmt.Sprintf("./uploads/profile_pictures/%d_%s", userID, file.Filename)

		// Make sure folder exists
		if _, err := os.Stat("./uploads/profile_pictures"); os.IsNotExist(err) {
			os.MkdirAll("./uploads/profile_pictures", os.ModePerm)
		}

		if err := c.SaveFile(file, filePath); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to save profile picture",
			})
		}

		user.Picture = filePath
	}

	// Update username if provided
	if input.Username != "" && input.Username != user.Username {
		// Check if username is already taken
		var existingUser User
		if err := db.Where("username = ?", input.Username).First(&existingUser).Error; err == nil && existingUser.ID != user.ID {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "Username is already taken",
			})
		}
		user.Username = input.Username
	}

	// Update email if provided
	if input.Email != "" && input.Email != user.Email {
		// Check if email is already taken
		var existingUser User
		if err := db.Where("email = ?", input.Email).First(&existingUser).Error; err == nil && existingUser.ID != user.ID {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "Email is already taken",
			})
		}
		user.Email = input.Email
	}

	// Update age if provided
	if input.Age != 0 {
		user.Age = input.Age
	}

	// Update gender if provided
	if input.Gender != "" {
		user.Sex = input.Gender
	}

	// Update ExpertCategories
	if len(input.ExpertCategoryIDs) > 0 {
		// Clear old expert categories
		if err := db.Model(&user).Association("ExpertCategories").Clear(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to clear existing expert categories",
			})
		}

		// Add new categories
		var newCategories []Category
		for _, categoryID := range input.ExpertCategoryIDs {
			newCategories = append(newCategories, Category{Model: gorm.Model{ID: categoryID}})
		}
		if err := db.Model(&user).Association("ExpertCategories").Append(newCategories); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update expert categories",
			})
		}
	}

	// Save updated user
	if err := db.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update user",
		})
	}

	return c.JSON(user)
}

func ChangePassword(db *gorm.DB, c *fiber.Ctx) error {
	// ดึง userID มาจาก JWT (ผ่าน middleware)
	userID := c.Locals("userID").(uint)

	// Find the user
	var user User
	if err := db.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// รับข้อมูลเก่ากับใหม่
	var input struct {
		OldPassword string `json:"oldPassword"`
		NewPassword string `json:"newPassword"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input",
		})
	}

	// ตรวจสอบรหัสผ่านเก่า
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.OldPassword)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Old password is incorrect",
		})
	}

	// Hash รหัสผ่านใหม่
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash new password",
		})
	}

	// อัปเดตใน database
	user.Password = string(hashedPassword)
	if err := db.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update password",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Password updated successfully",
	})
}

func GetCurrentUser(db *gorm.DB, c *fiber.Ctx) error {
	// Get userID from context (set by auth middleware)
	userID := c.Locals("userID").(uint)

	// Find user by ID
	var user User
	if err := db.Preload("ExpertCategories").First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Remove sensitive information
	user.Password = ""

	return c.JSON(user)
}

func LogoutUser(c *fiber.Ctx) error {
	// Clear the JWT cookie by setting an expired cookie with the same name
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour), // Set expiration to the past
		HTTPOnly: true,
		SameSite: "Lax",
		Secure:   false,
	})

	return c.JSON(fiber.Map{
		"message": "Successfully logged out",
	})
}
