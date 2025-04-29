package database

import (
	"encoding/json"
	"fmt"
	"time"
    "strconv"
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

type PostDTO struct {
	ID                uint            `json:"id"`
	Title             string          `json:"title"`
	Content           string          `json:"content"`
	Picture           string          `json:"picture"`
	RecommendAgeRange string          `json:"recommend_age_range"`
	Status            string          `json:"status"`
	Categories        []CategoryDTO   `json:"categories"`
	User              UserDTO         `json:"user"`
}

type CategoryDTO struct {
	ID             uint   `json:"id"`
	CategoriesName string `json:"categories_name"`
}

type UserDTO struct {
	Username string `json:"username"`
	Picture  string `json:"picture"`
}

func GetAllPosts(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		page, _ := strconv.Atoi(c.Query("page", "1"))
		limit, _ := strconv.Atoi(c.Query("limit", "10"))
		if page < 1 {
			page = 1
		}
		if limit < 1 {
			limit = 10
		}

		var posts []Post
		offset := (page - 1) * limit

		if err := db.Preload("User").
			Preload("Categories").
			Limit(limit).
			Offset(offset).
			Order("created_at desc").
			Find(&posts).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch posts",
			})
		}

		// Mapping Post -> PostDTO
		var postDTOs []PostDTO
		for _, post := range posts {
			var categories []CategoryDTO
			for _, cat := range post.Categories {
				categories = append(categories, CategoryDTO{
					ID:             cat.ID,
					CategoriesName: cat.CategoriesName,
				})
			}

			postDTO := PostDTO{
				ID:                post.ID,
				Title:             post.Title,
				Content:           post.Content,
				Picture:           post.Picture,
				RecommendAgeRange: post.RecommendAgeRange,
				Status:            post.Status,
				Categories:        categories,
				User: UserDTO{
					Username: post.User.Username,
					Picture:  post.User.Picture,
				},
			}
			postDTOs = append(postDTOs, postDTO)
		}

		return c.JSON(postDTOs)
	}
}

func GetPostByID(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		var post Post
		if err := db.Preload("User").
			Preload("Categories").
			First(&post, id).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Post not found",
			})
		}

		// Mapping Post -> PostDTO
		var categories []CategoryDTO
		for _, cat := range post.Categories {
			categories = append(categories, CategoryDTO{
				ID:             cat.ID,
				CategoriesName: cat.CategoriesName,
			})
		}

		postDTO := PostDTO{
			ID:                post.ID,
			Title:             post.Title,
			Content:           post.Content,
			Picture:           post.Picture,
			RecommendAgeRange: post.RecommendAgeRange,
			Status:            post.Status,
			Categories:        categories,
			User: UserDTO{
				Username: post.User.Username,
				Picture:  post.User.Picture,
			},
		}

		return c.JSON(postDTO)
	}
}

func DeletePost(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		postID := c.Params("id")
		userID := c.Locals("userID").(uint)

		var post Post
		if err := db.First(&post, postID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Post not found",
			})
		}

		// Check ownership
		if post.UserID != userID {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "You are not authorized to delete this post",
			})
		}

		// Delete the post and its related records
		if err := db.Delete(&post).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to delete post",
			})
		}

		return c.JSON(fiber.Map{
			"message": "Post deleted successfully",
		})
	}
}
