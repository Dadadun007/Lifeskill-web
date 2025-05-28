package database

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type Category struct {
	gorm.Model
	CategoriesName   string             `gorm:"size:100;not null;column:categories_name" json:"categories_name"`
	Post             []Post             `gorm:"many2many:post_categories;"`
	ExpertUsers      []User             `gorm:"many2many:user_expert_categories;"`
	TotalAchievement []TotalAchievement `gorm:"many2many:Total_Achievement"`
}

type PostCategory struct {
	PostID     uint `gorm:"primaryKey"`
	CategoryID uint `gorm:"primaryKey"`

	Post     Post     `gorm:"foreignKey:PostID;references:ID"`
	Category Category `gorm:"foreignKey:CategoryID;references:ID"`
}

type UserExpertCategory struct {
	UserID     uint `gorm:"primaryKey"`
	CategoryID uint `gorm:"primaryKey"`

	User     User     `gorm:"foreignKey:UserID;references:ID"`
	Category Category `gorm:"foreignKey:CategoryID;references:ID"`
}

type TotalAchievement struct {
	UserID     uint     `gorm:"primaryKey"`
	CategoryID uint     `gorm:"primaryKey;column:Categories_id"`
	User       User     `gorm:"foreignKey:UserID;references:ID"`
	Category   Category `gorm:"foreignKey:CategoryID;;references:ID"`

	Score int `gorm:"default:0"`
}

func CreateCategory(db *gorm.DB, c *fiber.Ctx) error {
	category := new(Category)
	if err := c.BodyParser(category); err != nil {
		return err
	}
	db.Create(&category)
	return c.JSON(category)
}

// GetAllCategories fetches all categories
func GetAllCategories(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var categories []Category
		if err := db.Find(&categories).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch categories",
			})
		}
		return c.JSON(categories)
	}
}
