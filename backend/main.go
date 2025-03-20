package main

import (
	"github.com/gofiber/fiber/v2"
	// "github.com/dadadun/lifskill/user"
	"github.com/dadadun/lifskill/database"
	"fmt"
)

func main() {
	app := fiber.New()
	fmt.Println("Starting application...")

	database.ConnectDatabase()

	fmt.Println("Application started successfully!")
  
	app.Get("/hello", func(c *fiber.Ctx) error {
	  return c.SendString("Hello World")
	})
  
	app.Listen(":8080")
  }