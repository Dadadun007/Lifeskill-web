package database

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type Comment struct {
	gorm.Model
	CommentContent string `gorm:"type:text;not null;column:comment_content"`
	UserID         uint   `gorm:"not null"`
	PostID         uint   `gorm:"not null"`
	ParentID       *uint  `gorm:"default:null"` // For reply functionality
	User           User   `gorm:"foreignKey:UserID;references:ID"`
	Post           Post   `gorm:"foreignKey:PostID;references:ID"`
}

type CreateCommentRequest struct {
	PostID         uint   `json:"post_id"`
	CommentContent string `json:"comment_content"`
	ParentID       *uint  `json:"parent_id"` // Optional: nil for top-level comment, or parent comment ID
}

func CreateComment(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID").(uint)

		var req CreateCommentRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid comment input",
			})
		}

		// Optional: Check if post exists
		var post Post
		if err := db.First(&post, req.PostID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Post not found",
			})
		}

		// Optional: If it's a reply, check if parent comment exists
		if req.ParentID != nil {
			var parent Comment
			if err := db.First(&parent, *req.ParentID).Error; err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Parent comment not found",
				})
			}
		}

		// Create comment or reply
		comment := Comment{
			CommentContent: req.CommentContent,
			UserID:         userID,
			PostID:         req.PostID,
			ParentID:       req.ParentID,
		}

		if err := db.Create(&comment).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create comment",
			})
		}

		return c.Status(fiber.StatusCreated).JSON(comment)
	}
}

// Get all comments for a post (public route)
func GetCommentsByPostID(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		postID := c.Params("post_id")
		var comments []Comment
		if err := db.Where("post_id = ?", postID).Order("created_at asc").Find(&comments).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch comments",
			})
		}
		return c.JSON(comments)
	}
}
