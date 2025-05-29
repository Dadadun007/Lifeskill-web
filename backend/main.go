package main

import (
	"fmt"
	"strconv"

	"github.com/dadadun/lifskill/database"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/golang-jwt/jwt/v4"
)

func authRequired(c *fiber.Ctx) error {
	cookie := c.Cookies("jwt")
	fmt.Println("JWT cookie received in middleware:", cookie)
	if cookie == "" {
		fmt.Println("No JWT cookie found!")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Missing JWT cookie",
		})
	}

	// Print the secret key length for debugging
	fmt.Printf("JWT Secret Key length in middleware: %d bytes\n", len(database.JwtSecretKey))

	token, err := jwt.ParseWithClaims(cookie, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Print the signing method for debugging
		fmt.Printf("Token signing method: %v\n", token.Method)
		return database.JwtSecretKey, nil
	})

	if err != nil {
		fmt.Printf("JWT parse error: %v\n", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token: " + err.Error(),
		})
	}

	if !token.Valid {
		fmt.Println("JWT token is not valid!")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token is not valid",
		})
	}

	claims, ok := token.Claims.(*jwt.StandardClaims)
	if !ok {
		fmt.Println("JWT claims type assert failed")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token claims",
		})
	}

	fmt.Println("JWT claims subject (userID):", claims.Subject)

	userID, err := strconv.ParseUint(claims.Subject, 10, 64)
	if err != nil {
		fmt.Println("Failed to parse userID from claims:", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid userID in token",
		})
	}

	c.Locals("userID", uint(userID))
	fmt.Println("userID saved in Locals:", userID)
	return c.Next()
}

func main() {
	app := fiber.New()
	database.LoadConfig()
	database.ConnectDatabase()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173",
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
	}))

	fmt.Println("Starting application...")

	app.Static("/", "../frontend/lifskill_frontend/dist")

	// Serve uploaded images
	app.Static("/uploads", "./uploads")

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

	app.Listen(":8080")
}
