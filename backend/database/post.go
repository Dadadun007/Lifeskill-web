package database

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	Title             string `gorm:"size:150;not null"`
	Content           string `gorm:"type:text;not null"`
	Picture           string `gorm:"size:255"`
	YouTubeLink       string `gorm:"size:255"`
	Like              int    `gorm:"default:0"`
	RecommendAgeRange string `gorm:"size:50;column:recommend_age_range"`
	Status            string `gorm:"size:20;default:'pending'"`
	ApprovedUsers     int    `gorm:"default:0;column:Total_Approved_Users"`
	UserID            uint   `gorm:"not null"`
	User              User   `gorm:"foreignKey:UserID;references:ID"`

	Categories   []Category     `gorm:"many2many:post_categories;"`
	PostApproval []PostApproval `gorm:"many2many:post_approval;"`
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
	YouTubeLink       string `json:"youtube_link"`
	RecommendAgeRange string `json:"RecommendAgeRange"`
	Categories        []uint `json:"Categories"`
}

func CreatePost(db *gorm.DB, c *fiber.Ctx) error {
	fmt.Println("userID in Locals:", c.Locals("userID"))
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
		YouTubeLink:       postData.YouTubeLink,
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
	ID                uint          `json:"id"`
	Title             string        `json:"title"`
	Content           string        `json:"content"`
	Picture           string        `json:"picture"`
	YouTubeLink       string        `json:"youtube_link"`
	RecommendAgeRange string        `json:"recommend_age_range"`
	Status            string        `json:"status"`
	Categories        []CategoryDTO `json:"categories"`
	User              UserDTO       `json:"user"`
	CreatedAt         time.Time     `json:"created_at"`
	HasLiked          bool          `json:"has_liked"`
	HasBookmarked     bool          `json:"has_bookmarked"`
	Comments          []CommentDTO  `json:"comments"`
	Like              int           `json:"like"`
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
			Preload("Comments").
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

			var comments []CommentDTO
			for _, comment := range post.Comments {
				comments = append(comments, CommentDTO{
					ID:        comment.ID,
					Content:   comment.CommentContent,
					CreatedAt: comment.CreatedAt,
					User: UserDTO{
						Username: comment.User.Username,
						Picture:  comment.User.Picture,
					},
				})
			}

			postDTO := PostDTO{
				ID:                post.ID,
				Title:             post.Title,
				Content:           post.Content,
				Picture:           post.Picture,
				YouTubeLink:       post.YouTubeLink,
				RecommendAgeRange: post.RecommendAgeRange,
				Status:            post.Status,
				Categories:        categories,
				User: UserDTO{
					Username: post.User.Username,
					Picture:  post.User.Picture,
				},
				CreatedAt: post.CreatedAt,
				Like:      post.Like,
				Comments:  comments,
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
			YouTubeLink:       post.YouTubeLink,
			RecommendAgeRange: post.RecommendAgeRange,
			Status:            post.Status,
			Categories:        categories,
			User: UserDTO{
				Username: post.User.Username,
				Picture:  post.User.Picture,
			},
			CreatedAt: post.CreatedAt,
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

func SearchPosts(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		query := c.Query("q", "")
		page, _ := strconv.Atoi(c.Query("page", "1"))
		limit, _ := strconv.Atoi(c.Query("limit", "10"))
		if page < 1 {
			page = 1
		}
		if limit < 1 {
			limit = 10
		}
		offset := (page - 1) * limit

		var posts []Post

		if err := db.Preload("User").
			Preload("Categories").
			Joins("LEFT JOIN post_categories pc ON pc.post_id = posts.id").
			Joins("LEFT JOIN categories c ON c.id = pc.category_id").
			Where("posts.title ILIKE ? OR c.categories_name ILIKE ?", "%"+query+"%", "%"+query+"%").
			Distinct("posts.*").
			Limit(limit).
			Offset(offset).
			Order("posts.created_at desc").
			Find(&posts).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to search posts: " + err.Error(),
			})
		}

		// Map to DTO
		var postDTOs []PostDTO
		for _, post := range posts {
			var categories []CategoryDTO
			for _, cat := range post.Categories {
				categories = append(categories, CategoryDTO{
					ID:             cat.ID,
					CategoriesName: cat.CategoriesName,
				})
			}

			postDTOs = append(postDTOs, PostDTO{
				ID:                post.ID,
				Title:             post.Title,
				Content:           post.Content,
				Picture:           post.Picture,
				YouTubeLink:       post.YouTubeLink,
				RecommendAgeRange: post.RecommendAgeRange,
				Status:            post.Status,
				Categories:        categories,
				User: UserDTO{
					Username: post.User.Username,
					Picture:  post.User.Picture,
				},
				CreatedAt: post.CreatedAt,
			})
		}

		return c.JSON(postDTOs)
	}
}

type PostLike struct {
	PostID uint `gorm:"primaryKey"`
	UserID uint `gorm:"primaryKey"`

	Post Post `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE"`
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

func LikePost(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID").(uint) // from middleware
		postID := c.Params("id")

		var post Post
		if err := db.First(&post, postID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Post not found",
			})
		}

		// Check if this user already liked this post
		var existingLike PostLike
		if err := db.Where("post_id = ? AND user_id = ?", postID, userID).First(&existingLike).Error; err == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "You have already liked this post",
			})
		}

		// Add the like
		newLike := PostLike{
			PostID: post.ID,
			UserID: userID,
		}
		if err := db.Create(&newLike).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to like post",
			})
		}

		// Increment the Like count on the Post
		post.Like++
		if err := db.Save(&post).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update post like count",
			})
		}

		return c.JSON(fiber.Map{
			"message": "Post liked successfully",
			"likes":   post.Like,
		})
	}
}

func GetMyPosts(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID").(uint)

		var posts []Post
		if err := db.
			Preload("User").
			Preload("Categories").
			Where("user_id = ?", userID).
			Order("created_at desc").
			Find(&posts).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch your posts",
			})
		}

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
				YouTubeLink:       post.YouTubeLink,
				RecommendAgeRange: post.RecommendAgeRange,
				Status:            post.Status,
				Categories:        categories,
				User: UserDTO{
					Username: post.User.Username,
					Picture:  post.User.Picture,
				},
				CreatedAt: post.CreatedAt,
			}
			postDTOs = append(postDTOs, postDTO)
		}

		return c.JSON(postDTOs)
	}
}

// Filter posts by category, age range, and most liked
func FilterPosts(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		categoryID := c.Query("category_id")
		recommendAgeRange := c.Query("recommend_age_range")
		sort := c.Query("sort") // 'mostlike' or 'recent'

		var posts []Post
		query := db.Preload("User").Preload("Categories").Preload("Comments")

		fmt.Println("FilterPosts - Received category_id:", categoryID)

		if categoryID != "" {
			// Attempt to convert categoryID to an integer to ensure it's a valid ID
			_, err := strconv.Atoi(categoryID)
			if err != nil {
				// Log invalid categoryID and return an error or skip filtering
				fmt.Println("FilterPosts - Invalid category_id received:", categoryID, "Error:", err)
				// Optionally, return an error to the frontend:
				// return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid category ID format"})
				// For now, we'll just skip the category filter for invalid IDs
			} else {
				query = query.Joins("JOIN post_categories pc ON pc.post_id = posts.id").Where("pc.category_id = ?", categoryID)
			}
		}
		if recommendAgeRange != "" {
			query = query.Where("recommend_age_range = ?", recommendAgeRange)
		}

		if sort == "mostlike" {
			query = query.Order("like DESC")
		} else {
			query = query.Order("created_at DESC")
		}

		if err := query.Find(&posts).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to filter posts",
			})
		}

		// Map to DTOs
		var postDTOs []PostDTO
		for _, post := range posts {
			var categories []CategoryDTO
			for _, cat := range post.Categories {
				categories = append(categories, CategoryDTO{
					ID:             cat.ID,
					CategoriesName: cat.CategoriesName,
				})
			}

			var comments []CommentDTO
			for _, comment := range post.Comments {
				comments = append(comments, CommentDTO{
					ID:        comment.ID,
					Content:   comment.CommentContent,
					CreatedAt: comment.CreatedAt,
					User: UserDTO{
						Username: comment.User.Username,
						Picture:  comment.User.Picture,
					},
				})
			}

			postDTO := PostDTO{
				ID:                post.ID,
				Title:             post.Title,
				Content:           post.Content,
				Picture:           post.Picture,
				YouTubeLink:       post.YouTubeLink,
				RecommendAgeRange: post.RecommendAgeRange,
				Status:            post.Status,
				Categories:        categories,
				User: UserDTO{
					Username: post.User.Username,
					Picture:  post.User.Picture,
				},
				CreatedAt: post.CreatedAt,
				Like:      post.Like,
				Comments:  comments,
			}
			postDTOs = append(postDTOs, postDTO)
		}

		return c.JSON(postDTOs)
	}
}

// Approve a post by an expert user
func ApprovePost(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID").(uint)
		postID := c.Params("id")

		// Find the post
		var post Post
		if err := db.Preload("Categories").First(&post, postID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Post not found"})
		}

		// Check if user is expert in any of the post's categories
		var user User
		if err := db.Preload("ExpertCategories").First(&user, userID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
		}

		isExpert := false
		for _, postCat := range post.Categories {
			for _, expertCat := range user.ExpertCategories {
				if postCat.ID == expertCat.ID {
					isExpert = true
					break
				}
			}
		}
		if !isExpert {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You are not an expert in this post's category"})
		}

		// Check if this user already approved this post
		var existingApproval PostApproval
		if err := db.Where("post_id = ? AND user_id = ?", post.ID, userID).First(&existingApproval).Error; err == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "You have already approved this post"})
		}

		// Add approval
		approval := PostApproval{
			PostID:     post.ID,
			UserID:     userID,
			ApprovedAt: time.Now(),
		}
		if err := db.Create(&approval).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to approve post"})
		}

		// Count total unique expert approvals for this post
		var approvalCount int64
		db.Model(&PostApproval{}).Where("post_id = ?", post.ID).Count(&approvalCount)

		if approvalCount >= 3 && post.Status != "approved" {
			post.Status = "approved"
			if err := db.Save(&post).Error; err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update post status"})
			}
		}

		return c.JSON(fiber.Map{"message": "Post approved", "current_approvals": approvalCount, "status": post.Status})
	}
}

// Get only approved posts
func GetApprovedPosts(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var posts []Post
		if err := db.Preload("User").Preload("Categories").Where("status = ?", "approved").Order("created_at desc").Find(&posts).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch approved posts"})
		}
		// Map to DTOs
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
				YouTubeLink:       post.YouTubeLink,
				RecommendAgeRange: post.RecommendAgeRange,
				Status:            post.Status,
				Categories:        categories,
				User: UserDTO{
					Username: post.User.Username,
					Picture:  post.User.Picture,
				},
				CreatedAt: post.CreatedAt,
			}
			postDTOs = append(postDTOs, postDTO)
		}
		return c.JSON(postDTOs)
	}
}

// RequestPost model
// (If you want to keep it separate from Post, otherwise you can use Post with a different type or flag)
type RequestPost struct {
	gorm.Model
	Title             string                `gorm:"size:150;not null"`
	Content           string                `gorm:"type:text;not null"`
	Picture           string                `gorm:"size:255"`
	RecommendAgeRange string                `gorm:"size:50;column:recommend_age_range"`
	Status            string                `gorm:"size:20;default:'pending'"`
	UserID            uint                  `gorm:"not null"`
	User              User                  `gorm:"foreignKey:UserID;references:ID"`
	Categories        []Category            `gorm:"many2many:request_post_categories;"`
	Approvals         []RequestPostApproval `gorm:"many2many:request_post_approval;"`
}

type RequestPostApproval struct {
	RequestPostID uint      `gorm:"primaryKey"`
	UserID        uint      `gorm:"primaryKey"`
	ApprovedAt    time.Time `gorm:"not null;default:current_timestamp"`

	RequestPost RequestPost `gorm:"foreignKey:RequestPostID;references:ID"`
	User        User        `gorm:"foreignKey:UserID;references:ID"`
}

type CreateRequestPostRequest struct {
	Title             string `json:"title"`
	Content           string `json:"content"`
	RecommendAgeRange string `json:"RecommendAgeRange"`
	Categories        []uint `json:"Categories"`
}

func CreateRequestPost(db *gorm.DB, c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	postData := new(CreateRequestPostRequest)
	if err := json.Unmarshal([]byte(c.FormValue("post")), postData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse post JSON: " + err.Error(),
		})
	}

	file, err := c.FormFile("picture")
	pictureFilename := ""
	if err == nil && file != nil {
		filePath := fmt.Sprintf("./uploads/%s", file.Filename)
		if err := c.SaveFile(file, filePath); err == nil {
			pictureFilename = file.Filename
		}
	}

	var categories []Category
	if len(postData.Categories) > 0 {
		if err := db.Where("id IN ?", postData.Categories).Find(&categories).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Some categories not found: " + err.Error(),
			})
		}
	}

	requestPost := RequestPost{
		Title:             postData.Title,
		Content:           postData.Content,
		Picture:           pictureFilename,
		RecommendAgeRange: postData.RecommendAgeRange,
		Status:            "pending",
		UserID:            userID,
		Categories:        categories,
	}

	if err := db.Create(&requestPost).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create request post: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(requestPost)
}

// Approve a request post by an expert user
func ApproveRequestPost(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID").(uint)
		requestPostID := c.Params("id")

		var requestPost RequestPost
		if err := db.Preload("Categories").First(&requestPost, requestPostID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Request post not found"})
		}

		var user User
		if err := db.Preload("ExpertCategories").First(&user, userID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
		}

		isExpert := false
		for _, postCat := range requestPost.Categories {
			for _, expertCat := range user.ExpertCategories {
				if postCat.ID == expertCat.ID {
					isExpert = true
					break
				}
			}
		}
		if !isExpert {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You are not an expert in this request post's category"})
		}

		var existingApproval RequestPostApproval
		if err := db.Where("request_post_id = ? AND user_id = ?", requestPost.ID, userID).First(&existingApproval).Error; err == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "You have already approved this request post"})
		}

		approval := RequestPostApproval{
			RequestPostID: requestPost.ID,
			UserID:        userID,
			ApprovedAt:    time.Now(),
		}
		if err := db.Create(&approval).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to approve request post"})
		}

		var approvalCount int64
		db.Model(&RequestPostApproval{}).Where("request_post_id = ?", requestPost.ID).Count(&approvalCount)

		if approvalCount >= 3 && requestPost.Status != "approved" {
			requestPost.Status = "approved"
			if err := db.Save(&requestPost).Error; err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update request post status"})
			}
		}

		return c.JSON(fiber.Map{"message": "Request post approved", "current_approvals": approvalCount, "status": requestPost.Status})
	}
}

// Get all pending posts for expert user to approve
func GetPendingPostsForExpert(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID").(uint)

		// Get expert categories for this user
		var user User
		if err := db.Preload("ExpertCategories").First(&user, userID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
		}
		var expertCategoryIDs []uint
		for _, cat := range user.ExpertCategories {
			expertCategoryIDs = append(expertCategoryIDs, cat.ID)
		}
		if len(expertCategoryIDs) == 0 {
			return c.JSON([]PostDTO{}) // No expert categories, return empty
		}

		// Find posts with status 'pending' and at least one matching category
		var posts []Post
		err := db.Preload("User").Preload("Categories").
			Joins("JOIN post_categories pc ON pc.post_id = posts.id").
			Where("posts.status = ? AND pc.category_id IN ?", "pending", expertCategoryIDs).
			Group("posts.id").
			Order("posts.created_at desc").
			Find(&posts).Error
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch pending posts"})
		}

		// Map to DTOs
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
				YouTubeLink:       post.YouTubeLink,
				RecommendAgeRange: post.RecommendAgeRange,
				Status:            post.Status,
				Categories:        categories,
				User: UserDTO{
					Username: post.User.Username,
					Picture:  post.User.Picture,
				},
				CreatedAt: post.CreatedAt,
			}
			postDTOs = append(postDTOs, postDTO)
		}
		return c.JSON(postDTOs)
	}
}

// Achieve a post: increment user's TotalAchievement score for each category of the post
func AchievePost(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID").(uint)
		postID := c.Params("id")

		// Find the post and its categories
		var post Post
		if err := db.Preload("Categories").First(&post, postID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Post not found"})
		}

		for _, cat := range post.Categories {
			var achievement TotalAchievement
			err := db.Where("user_id = ? AND category_id = ?", userID, cat.ID).First(&achievement).Error
			if err != nil {
				// Not found, create new
				achievement = TotalAchievement{
					UserID:     userID,
					CategoryID: cat.ID,
					Score:      1,
				}
				db.Create(&achievement)
			} else {
				// Found, increment score
				achievement.Score++
				db.Save(&achievement)
			}
		}

		return c.JSON(fiber.Map{"message": "Achievement updated for post categories"})
	}
}

// Get current user's achievement scores for each category
func GetMyAchievements(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID").(uint)
		var achievements []TotalAchievement
		if err := db.Preload("Category").Where("user_id = ?", userID).Find(&achievements).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch achievements"})
		}

		type AchievementDTO struct {
			CategoryID   uint   `json:"category_id"`
			CategoryName string `json:"category_name"`
			Score        int    `json:"score"`
		}
		var result []AchievementDTO
		for _, a := range achievements {
			result = append(result, AchievementDTO{
				CategoryID:   a.CategoryID,
				CategoryName: a.Category.CategoriesName,
				Score:        a.Score,
			})
		}
		return c.JSON(result)
	}
}

// Get all posts that the current user has achieved (by category achievement)
func GetMyAchievedPosts(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID").(uint)

		// Get all category IDs where user has achievement
		var achievements []TotalAchievement
		if err := db.Where("user_id = ? AND score > 0", userID).Find(&achievements).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch achievements"})
		}
		var achievedCategoryIDs []uint
		for _, a := range achievements {
			achievedCategoryIDs = append(achievedCategoryIDs, a.CategoryID)
		}
		if len(achievedCategoryIDs) == 0 {
			return c.JSON([]PostDTO{})
		}

		// Find posts that have at least one category in achievedCategoryIDs
		var posts []Post
		err := db.Preload("User").Preload("Categories").
			Joins("JOIN post_categories pc ON pc.post_id = posts.id").
			Where("pc.category_id IN ?", achievedCategoryIDs).
			Group("posts.id").
			Order("posts.created_at desc").
			Find(&posts).Error
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch achieved posts"})
		}

		// Map to DTOs
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
				YouTubeLink:       post.YouTubeLink,
				RecommendAgeRange: post.RecommendAgeRange,
				Status:            post.Status,
				Categories:        categories,
				User: UserDTO{
					Username: post.User.Username,
					Picture:  post.User.Picture,
				},
				CreatedAt: post.CreatedAt,
			}
			postDTOs = append(postDTOs, postDTO)
		}
		return c.JSON(postDTOs)
	}
}

// Recommend posts by age range
func RecommendPostsByAge(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ageStr := c.Query("age")
		var age int
		var err error
		if ageStr != "" {
			age, err = strconv.Atoi(ageStr)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid age parameter"})
			}
		} else {
			// If user is authenticated, use their age
			userIDVal := c.Locals("userID")
			if userIDVal != nil {
				var user User
				if err := db.First(&user, userIDVal.(uint)).Error; err == nil {
					age = user.Age
				}
			}
		}
		if age == 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Age is required as query or user profile"})
		}

		var posts []Post
		if err := db.Preload("User").Preload("Categories").Find(&posts).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch posts"})
		}

		var recommended []PostDTO
		for _, post := range posts {
			// RecommendAgeRange format: "10-15"
			parts := strings.Split(post.RecommendAgeRange, "-")
			if len(parts) == 2 {
				minAge, err1 := strconv.Atoi(strings.TrimSpace(parts[0]))
				maxAge, err2 := strconv.Atoi(strings.TrimSpace(parts[1]))
				if err1 == nil && err2 == nil && age >= minAge && age <= maxAge {
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
						YouTubeLink:       post.YouTubeLink,
						RecommendAgeRange: post.RecommendAgeRange,
						Status:            post.Status,
						Categories:        categories,
						User: UserDTO{
							Username: post.User.Username,
							Picture:  post.User.Picture,
						},
						CreatedAt: post.CreatedAt,
					}
					recommended = append(recommended, postDTO)
				}
			}
		}
		return c.JSON(recommended)
	}
}

// CommentDTO represents a comment in API responses
type CommentDTO struct {
	ID        uint      `json:"id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	User      UserDTO   `json:"user"`
}

// Get post details with comments and user info
func GetPostDetails(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		postID := c.Params("id")
		userID, ok := c.Locals("userID").(uint)

		var post Post
		if err := db.Preload("User").
			Preload("Categories").
			Preload("Comments", func(db *gorm.DB) *gorm.DB {
				return db.Preload("User").Order("created_at DESC")
			}).
			First(&post, postID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Post not found",
			})
		}

		// Initialize postDTO
		postDTO := PostDTO{
			ID:                post.ID,
			Title:             post.Title,
			Content:           post.Content,
			Picture:           post.Picture,
			YouTubeLink:       post.YouTubeLink,
			RecommendAgeRange: post.RecommendAgeRange,
			Status:            post.Status,
			Categories:        []CategoryDTO{},
			User: UserDTO{
				Username: post.User.Username,
				Picture:  post.User.Picture,
			},
			CreatedAt:     post.CreatedAt,
			HasLiked:      false,
			HasBookmarked: false,
			Like: post.Like,
			Comments:      []CommentDTO{},
		}

		// Only check likes and bookmarks if user is logged in
		if ok {
			// Check if user has liked the post
			var like PostLike
			postDTO.HasLiked = db.Where("post_id = ? AND user_id = ?", postID, userID).First(&like).Error == nil

			// Check if user has bookmarked the post
			var bookmark Bookmark
			postDTO.HasBookmarked = db.Where("post_id = ? AND user_id = ?", postID, userID).First(&bookmark).Error == nil
		}

		// Map categories
		for _, cat := range post.Categories {
			postDTO.Categories = append(postDTO.Categories, CategoryDTO{
				ID:             cat.ID,
				CategoriesName: cat.CategoriesName,
			})
		}

		// Map comments
		for _, comment := range post.Comments {
			postDTO.Comments = append(postDTO.Comments, CommentDTO{
				ID:        comment.ID,
				Content:   comment.CommentContent,
				CreatedAt: comment.CreatedAt,
				User: UserDTO{
					Username: comment.User.Username,
					Picture:  comment.User.Picture,
				},
			})
		}

		return c.JSON(postDTO)
	}
}

// Add a comment to a post
func AddComment(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID").(uint)
		postID, err := strconv.ParseUint(c.Params("id"), 10, 64)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid post ID",
			})
		}

		var input struct {
			Content string `json:"content"`
		}

		if err := c.BodyParser(&input); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid input",
			})
		}

		comment := Comment{
			CommentContent: input.Content,
			UserID:         userID,
			PostID:         uint(postID),
		}

		if err := db.Create(&comment).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create comment",
			})
		}

		// Load user info for the response
		if err := db.Preload("User").First(&comment, comment.ID).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to load comment details",
			})
		}

		return c.JSON(CommentDTO{
			ID:        comment.ID,
			Content:   comment.CommentContent,
			CreatedAt: comment.CreatedAt,
			User: UserDTO{
				Username: comment.User.Username,
				Picture:  comment.User.Picture,
			},
		})
	}
}

// Toggle bookmark for a post
func ToggleBookmark(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("userID").(uint)
		postID, err := strconv.ParseUint(c.Params("id"), 10, 64)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid post ID",
			})
		}

		// First, get the post with its categories
		var post Post
		if err := db.Preload("Categories").First(&post, postID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Post not found",
			})
		}

		var bookmark Bookmark
		err = db.Where("post_id = ? AND user_id = ?", postID, userID).First(&bookmark).Error

		if err == nil {
			// Bookmark exists, remove it
			if err := db.Delete(&bookmark).Error; err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to remove bookmark",
				})
			}

			// Decrement achievement scores for each category
			for _, cat := range post.Categories {
				var achievement TotalAchievement
				if err := db.Where("user_id = ? AND category_id = ?", userID, cat.ID).First(&achievement).Error; err == nil {
					if achievement.Score > 0 {
						achievement.Score--
						db.Save(&achievement)
					}
				}
			}

			return c.JSON(fiber.Map{
				"message":    "Bookmark removed",
				"bookmarked": false,
			})
		}

		// Create new bookmark
		bookmark = Bookmark{
			UserID: userID,
			PostID: uint(postID),
		}

		if err := db.Create(&bookmark).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create bookmark",
			})
		}

		// Increment achievement scores for each category
		for _, cat := range post.Categories {
			var achievement TotalAchievement
			err := db.Where("user_id = ? AND category_id = ?", userID, cat.ID).First(&achievement).Error
			if err != nil {
				// Not found, create new
				achievement = TotalAchievement{
					UserID:     userID,
					CategoryID: cat.ID,
					Score:      1,
				}
				db.Create(&achievement)
			} else {
				// Found, increment score
				achievement.Score++
				db.Save(&achievement)
			}
		}

		return c.JSON(fiber.Map{
			"message":    "Post bookmarked",
			"bookmarked": true,
		})
	}
}

// Bookmark model
type Bookmark struct {
	gorm.Model
	UserID uint `gorm:"not null"`
	PostID uint `gorm:"not null"`
	User   User `gorm:"foreignKey:UserID;references:ID"`
	Post   Post `gorm:"foreignKey:PostID;references:ID"`
}
