package main

import (
	"fmt"
	"strconv"

	"github.com/dadadun/lifskill/config"
	"github.com/dadadun/lifskill/database"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/golang-jwt/jwt/v4"
)

type CustomClaims struct {
	jwt.StandardClaims
	UserID uint `json:"user_id"`
}

func authRequired(c *fiber.Ctx) error {
	cookie := c.Cookies("jwt")
	if cookie == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Missing JWT cookie",
		})
	}

	token, err := jwt.ParseWithClaims(cookie, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return database.JwtSecretKey, nil
	})

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token",
		})
	}

	if !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token is not valid",
		})
	}

	claims, ok := token.Claims.(*CustomClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token claims",
		})
	}

	// Check token expiration
	if claims.ExpiresAt < time.Now().Unix() {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token has expired",
		})
	}

	c.Locals("userID", claims.UserID)
	return c.Next()
}

func main() {
	app := fiber.New()

	// Load configuration
	config.LoadConfig()
	database.ConnectDatabase()

	// Add security headers
	app.Use(helmet.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins:     config.AppConfig.FrontendURL,
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
	}))

	fmt.Println("Starting application...")

	app.Static("/", "../frontend/lifskill_frontend/dist")

	// Serve uploaded images
	app.Static("/uploads", config.AppConfig.UploadDir)

	fmt.Println("Application started successfully!")

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendFile("../frontend/lifskill_frontend/dist/index.html")
	})

	// Public routes
	app.Post("/register", func(c *fiber.Ctx) error {
		return database.CreateUser(database.DB, c)
	})
	app.Post("/login", func(c *fiber.Ctx) error {
		return database.LoginUser(database.DB, c)
	})
	app.Post("/auth/logout", database.LogoutUser)

	app.Get("/get_all_post", database.GetAllPosts(database.DB))
	app.Get("/get_post_by_id/:id", database.GetPostByID(database.DB))
	app.Get("/post/:id", database.GetPostDetails(database.DB))
	app.Get("/search_post", database.SearchPosts(database.DB))
	app.Get("/comments/:post_id", database.GetCommentsByPostID(database.DB))
	app.Get("/filter_posts", database.FilterPosts(database.DB))
	app.Get("/approved_posts", database.GetApprovedPosts(database.DB))
	app.Get("/recommend_posts_by_age", database.RecommendPostsByAge(database.DB))

	// New public route to get all categories
	app.Get("/categories", database.GetAllCategories(database.DB))

	// Auth-protected group
	auth := app.Group("/", authRequired)

	auth.Post("/category", func(c *fiber.Ctx) error {
		return database.CreateCategory(database.DB, c)
	})

	auth.Post("/create_post", func(c *fiber.Ctx) error {
		return database.CreatePost(database.DB, c)
	})

	// New post-related endpoints
	// New post-related endpoints
	auth.Post("/post/:id/comment", database.AddComment(database.DB))
	auth.Put("/post/:id/bookmark", database.ToggleBookmark(database.DB))
	auth.Delete("/delete_posts/:id", database.DeletePost(database.DB))

	auth.Put("/like_post/:id", database.LikePost(database.DB))
	auth.Get("/my-posts", database.GetMyPosts(database.DB))
	auth.Post("/create_comments", database.CreateComment(database.DB))
	auth.Put("/user/update", func(c *fiber.Ctx) error {
		return database.UpdateUser(database.DB, c)
	})
	auth.Put("/user/change-password", func(c *fiber.Ctx) error {
		return database.ChangePassword(database.DB, c)
	})
	auth.Get("/user/me", func(c *fiber.Ctx) error {
		return database.GetCurrentUser(database.DB, c)
	})
	auth.Put("/approve_post/:id", database.ApprovePost(database.DB))
	auth.Get("/request_post", database.GetPendingPostsForExpert(database.DB))
	auth.Post("/achieve_post/:id", database.AchievePost(database.DB))
	auth.Get("/my_achievements", database.GetMyAchievements(database.DB))
	auth.Get("/my_achieved_posts", database.GetMyAchievedPosts(database.DB))

	// Start server with configured port
	app.Listen(":" + config.AppConfig.Port)
}
