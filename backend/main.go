package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/dadadun/lifskill/database"
	"fmt"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/golang-jwt/jwt/v4"
)

func authRequired(c *fiber.Ctx) error {
	cookie := c.Cookies("jwt")
  
	token, err := jwt.ParseWithClaims(cookie, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		return database.JwtSecretKey, nil
	})
  
	if err != nil || !token.Valid {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
  
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
	app.Use("/still_fixing", authRequired)

	app.Listen(":8080")
  }