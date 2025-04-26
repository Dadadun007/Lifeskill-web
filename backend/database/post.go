package database

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"time"
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
type CreatePostInput struct {
	Title             string `json:"title"`
	Content           string `json:"content"`
	Picture           string `json:"picture"`
	RecommendAgeRange string `json:"recommend_age_range"`
	CategoryIDs       []uint `json:"category_ids"` // <<< รับ array ของ Category id in Json "category_ids": [1, 2]
}

func CreatePost(db *gorm.DB, c *fiber.Ctx) error {
    // Parse form
    var input CreatePostInput
    if err := c.BodyParser(&input); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Failed to parse form: " + fmt.Sprint(err),
        })
    }
    
    // Get form values directly
    title := c.FormValue("title")
    content := c.FormValue("content")
    recommendAgeRange := c.FormValue("recommendAgeRange")
    categoryIDsStr := c.FormValue("categoryIds") // Check the exact field name in your form
    
    // Parse category IDs
    var categoryIDs []uint
    // First try as comma-separated list
    if categoryIDsStr != "" {
        for _, idStr := range strings.Split(categoryIDsStr, ",") {
            if id, err := strconv.ParseUint(strings.TrimSpace(idStr), 10, 32); err == nil {
                categoryIDs = append(categoryIDs, uint(id))
            }
        }
    }
    
    fmt.Println("CategoryIDs parsed:", categoryIDs, "from string:", categoryIDsStr)
    
    userID := c.Locals("userID").(uint)
    
    // Upload Picture
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
    
    // Create Post object
    post := Post{
        Title:             title,
        Content:           content,
        Picture:           file.Filename,
        RecommendAgeRange: recommendAgeRange,
        Status:            "pending",
        ApprovedUsers:     0,
        UserID:            userID,
    }
    
    // Start transaction
    tx := db.Begin()
    
    // Save Post to database
    if err := tx.Create(&post).Error; err != nil {
        tx.Rollback()
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to create post: " + err.Error(),
        })
    }
    
    // Associate Categories - directly create entries in junction table
    if len(categoryIDs) > 0 {
        for _, catID := range categoryIDs {
            // Check if category exists
            var category Category
            if err := tx.First(&category, catID).Error; err != nil {
                tx.Rollback()
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                    "error": fmt.Sprintf("Category with ID %d not found", catID),
                })
            }
            
            // Create association
            postCategory := PostCategory{
                PostID:     post.ID,
                CategoryID: catID,
            }
            
            if err := tx.Create(&postCategory).Error; err != nil {
                tx.Rollback()
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "error": "Failed to link category: " + err.Error(),
                })
            }
        }
    }
    
    // Commit transaction
    if err := tx.Commit().Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to commit transaction: " + err.Error(),
        })
    }
    
    // Fetch complete post with associations
    var fullPost Post
    if err := db.Preload("User").Preload("Categories").First(&fullPost, post.ID).Error; err != nil {
        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "message": "Post created but failed to load details",
            "postID":  post.ID,
        })
    }
    
    return c.Status(fiber.StatusCreated).JSON(fullPost)
}