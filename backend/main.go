package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/dadadun/lifskill/database"
	"fmt"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/golang-jwt/jwt/v4"
	"strconv"
)

func authRequired(c *fiber.Ctx) error {
	cookie := c.Cookies("jwt")
	if cookie == "" {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	// Parse JWT token
	token, err := jwt.ParseWithClaims(cookie, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		return database.JwtSecretKey, nil
	})

	if err != nil || !token.Valid {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	// Extract user ID from claims
	claims, ok := token.Claims.(*jwt.StandardClaims)
	if !ok {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	userID, err := strconv.ParseUint(claims.Subject, 10, 64)
	if err != nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	// Save userID ลง Context
	c.Locals("userID", uint(userID))

	return c.Next()
}


func main() {
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowCredentials: true,
	}))
	
	fmt.Println("Starting application...")

	database.LoadConfig()
	database.ConnectDatabase()

	// load frontend files
	app.Static("/", "../frontend/lifskill_frontend/dist")

	fmt.Println("Application started successfully!")
  
	// Define routes
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendFile("../frontend/lifskill_frontend/dist/index.html")
	})
  
	// about authentication
	app.Post("/register", func(c *fiber.Ctx) error {
		return database.CreateUser(database.DB, c)
	})

	app.Post("/login", func(c *fiber.Ctx) error {
		return database.LoginUser(database.DB, c)
	})

	// รอใส่ route ที่ต้อง login ก่อน
	app.Use("/category", "/user", authRequired)

	// add category
	app.Post("/category", func(c *fiber.Ctx) error {
		return database.CreateCategory(database.DB, c)
	})

	// สร้างโพสต์
	app.Post("/post", func(c *fiber.Ctx) error {
		return database.CreatePost(database.DB, c)
	})

	app.Get("/post", database.GetAllPosts(database.DB))

	app.Get("/post/:id", database.GetPostByID(database.DB))

	app.Delete("/posts/:id", database.DeletePost(database.DB))

	app.Get("/posts/search", database.SearchPosts(database.DB))

	app.Put("/posts/:id/like", database.LikePost(database.DB))

	app.Get("/my-posts", database.GetMyPosts(database.DB))


	app.Put("/user", func(c *fiber.Ctx) error {
		return database.UpdateUser(database.DB, c)
	})

	app.Put("/user/change-password", func(c *fiber.Ctx) error {
		return database.ChangePassword(database.DB, c)
	})

	app.Listen(":8080")
}