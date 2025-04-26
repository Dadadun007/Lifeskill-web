package database

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	Title             string `gorm:"size:150;not null"`
	Content           string `gorm:"type:text;not null"`
	Picture           string `gorm:"size:255"`
	Like              int    `gorm:"default:0"`
	RecommendAgeRange string `gorm:"size:50;column:recommend_age_range"`
	Status            string `gorm:"size:20;default:'pending'"`
	ApprovedUsers     int    `gorm:"default:0;column:Total_Approved_Users"`
	UserID            uint   `gorm:"not null"`
	User              User   `gorm:"foreignKey:UserID;references:ID"`

	Categories   []Category     `gorm:"many2many:post_categories;"`
	PostApproval []PostApproval `gorm:"any2many:post_approval;"`
	Comments     []Comment      `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE"`
}

type PostApproval struct {
	PostID     uint      `gorm:"primaryKey"`
	UserID     uint      `gorm:"primaryKey"`
	ApprovedAt time.Time `gorm:"not null;default:current_timestamp"`

	Post Post `gorm:"foreignKey:PostID;references:ID"`
	User User `gorm:"foreignKey:UserID;references:ID"`
}

// ส่ง input ของ Post
type CreatePostRequest struct {
	Title             string `json:"title"`
	Content           string `json:"content"`
	RecommendAgeRange string `json:"RecommendAgeRange"`
	Categories        []uint `json:"Categories"`
}

func CreatePost(db *gorm.DB, c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	// 1. Parse the `post` field (JSON inside FormData)
	postData := new(CreatePostRequest)
	if err := json.Unmarshal([]byte(c.FormValue("post")), postData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse post JSON: " + err.Error(),
		})
	}

	// 2. Parse the uploaded file
	file, err := c.FormFile("picture")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Picture upload failed: " + err.Error(),
		})
	}
	filePath := fmt.Sprintf("./uploads/%s", file.Filename)
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save picture: " + err.Error(),
		})
	}

	// 3. Find categories
	var categories []Category
	if len(postData.Categories) > 0 {
		if err := db.Where("id IN ?", postData.Categories).Find(&categories).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Some categories not found: " + err.Error(),
			})
		}
	}

	// 4. Create Post
	post := Post{
		Title:             postData.Title,
		Content:           postData.Content,
		Picture:           file.Filename,
		RecommendAgeRange: postData.RecommendAgeRange,
		Status:            "pending",
		ApprovedUsers:     0,
		UserID:            userID,
		Categories:        categories,
	}

	if err := db.Create(&post).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create post: " + err.Error(),
		})
	}

	// 5. Return full post with relations
	var fullPost Post
	if err := db.Preload("User").Preload("Categories").First(&fullPost, post.ID).Error; err != nil {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "Post created but failed to load details",
			"postID":  post.ID,
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fullPost)
}
