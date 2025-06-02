package main

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/dadadun/lifskill/config"
	"github.com/dadadun/lifskill/database"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/logger"
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

	// Check token expiration
	if claims.ExpiresAt < time.Now().Unix() {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token has expired",
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
	app := fiber.New(fiber.Config{
		AppName:      "Lifskill API",
		ServerHeader: "Lifskill",
		// Enable case sensitive routing
		CaseSensitive: true,
		// Enable strict routing
		StrictRouting: true,
		// Enable body parsing
		BodyLimit: 10 * 1024 * 1024, // 10MB
	})

	// Load configuration
	config.LoadConfig()
	database.ConnectDatabase()

	// Security middleware
	app.Use(helmet.New())

	// Request logging with more details
	app.Use(logger.New(logger.Config{
		Format:     "${time} | ${status} | ${latency} | ${method} | ${path} | ${ip} | ${error}\n",
		TimeFormat: "2006-01-02 15:04:05",
		TimeZone:   "Local",
		Output:     os.Stdout,
	}))

	// Add detailed request debugging middleware
	app.Use(func(c *fiber.Ctx) error {
		fmt.Printf("\n=== Incoming Request ===\n")
		fmt.Printf("Method: %s\n", c.Method())
		fmt.Printf("Path: %s\n", c.Path())
		fmt.Printf("Origin: %s\n", c.Get("Origin"))
		fmt.Printf("Headers: %v\n", c.GetReqHeaders())
		fmt.Printf("Query: %v\n", c.Query(""))
		fmt.Printf("Body: %s\n", string(c.Body()))
		fmt.Printf("=====================\n")
		return c.Next()
	})

	// Add response debugging middleware
	app.Use(func(c *fiber.Ctx) error {
		err := c.Next()
		fmt.Printf("\n=== Outgoing Response ===\n")
		fmt.Printf("Status: %d\n", c.Response().StatusCode())
		fmt.Printf("Headers: %v\n", c.GetRespHeaders())
		fmt.Printf("Body: %s\n", string(c.Response().Body()))
		fmt.Printf("======================\n")
		return err
	})

	// Configure CORS with more secure settings and debug logging
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "https://lifskill-web-frontend.onrender.com,https://lifskill-backend.onrender.com,https://lifeskill-web.onrender.com,http://localhost:5173",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Credentials",
		ExposeHeaders:    "Set-Cookie",
		AllowCredentials: true,
		MaxAge:           3600,
		Next: func(c *fiber.Ctx) bool {
			fmt.Printf("\n=== CORS Check ===\n")
			fmt.Printf("Origin: %s\n", c.Get("Origin"))
			fmt.Printf("Method: %s\n", c.Method())
			fmt.Printf("Path: %s\n", c.Path())
			fmt.Printf("Headers: %v\n", c.GetReqHeaders())
			fmt.Printf("=================\n")
			return false
		},
	}))

	// Add response headers middleware
	app.Use(func(c *fiber.Ctx) error {
		origin := c.Get("Origin")
		fmt.Printf("\n=== Setting Response Headers ===\n")
		fmt.Printf("Origin: %s\n", origin)

		allowedOrigins := []string{
			"https://lifskill-web-frontend.onrender.com",
			"https://lifskill-backend.onrender.com",
			"https://lifeskill-web.onrender.com",
			"http://localhost:5173",
		}

		// Check if origin is allowed
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				c.Set("Access-Control-Allow-Origin", origin)
				c.Set("Access-Control-Allow-Credentials", "true")
				c.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
				c.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Credentials")

				fmt.Printf("Set headers:\n")
				fmt.Printf("Access-Control-Allow-Origin: %s\n", origin)
				fmt.Printf("Access-Control-Allow-Credentials: true\n")
				fmt.Printf("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS\n")
				fmt.Printf("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Credentials\n")
				break
			}
		}

		fmt.Printf("======================\n")
		return c.Next()
	})

	// Add OPTIONS handler for preflight requests with debug logging
	app.Options("*", func(c *fiber.Ctx) error {
		fmt.Printf("\n=== Preflight Request ===\n")
		fmt.Printf("Origin: %s\n", c.Get("Origin"))
		fmt.Printf("Method: %s\n", c.Method())
		fmt.Printf("Path: %s\n", c.Path())
		fmt.Printf("Headers: %v\n", c.GetReqHeaders())

		origin := c.Get("Origin")
		allowedOrigins := []string{
			"https://lifskill-web-frontend.onrender.com",
			"https://lifskill-backend.onrender.com",
			"https://lifeskill-web.onrender.com",
			"http://localhost:5173",
		}

		// Check if origin is allowed
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				c.Set("Access-Control-Allow-Origin", origin)
				c.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
				c.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Credentials")
				c.Set("Access-Control-Allow-Credentials", "true")
				c.Set("Access-Control-Max-Age", "3600")

				fmt.Printf("CORS Headers Set:\n")
				fmt.Printf("Access-Control-Allow-Origin: %s\n", origin)
				fmt.Printf("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS\n")
				fmt.Printf("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Credentials\n")
				fmt.Printf("Access-Control-Allow-Credentials: true\n")
				fmt.Printf("Access-Control-Max-Age: 3600\n")
				break
			}
		}

		fmt.Printf("=====================\n")
		return c.SendStatus(fiber.StatusNoContent)
	})

	// Add error handler for 404s with debug logging
	app.Use(func(c *fiber.Ctx) error {
		err := c.Next()
		if err != nil {
			if err == fiber.ErrNotFound {
				fmt.Printf("\n=== 404 Not Found ===\n")
				fmt.Printf("Method: %s\n", c.Method())
				fmt.Printf("Path: %s\n", c.Path())
				fmt.Printf("Origin: %s\n", c.Get("Origin"))
				fmt.Printf("Headers: %v\n", c.GetReqHeaders())
				fmt.Printf("===================\n")

				// Set CORS headers even for 404 responses
				origin := c.Get("Origin")
				allowedOrigins := []string{
					"https://lifskill-web-frontend.onrender.com",
					"https://lifskill-backend.onrender.com",
					"https://lifeskill-web.onrender.com",
					"http://localhost:5173",
				}

				// Check if origin is allowed
				for _, allowedOrigin := range allowedOrigins {
					if origin == allowedOrigin {
						c.Set("Access-Control-Allow-Origin", origin)
						c.Set("Access-Control-Allow-Credentials", "true")
						break
					}
				}

				return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
					"error":  "Route not found",
					"path":   c.Path(),
					"method": c.Method(),
				})
			}
			return err
		}
		return nil
	})

	fmt.Println("Starting application...")

	// Serve static files with security headers
	app.Static("/", "../frontend/lifskill_frontend/dist", fiber.Static{
		MaxAge: 3600,
	})

	// Serve uploaded images with security headers
	app.Static("/uploads", config.AppConfig.UploadDir, fiber.Static{
		MaxAge: 3600,
	})

	fmt.Println("Application started successfully!")

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

	// Start server with configured port
	app.Listen(":" + config.AppConfig.Port)
}
