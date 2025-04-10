package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/dadadun/lifskill/database"
	"fmt"
)

func main() {
	app := fiber.New()
	fmt.Println("Starting application...")

	database.ConnectDatabase()

	// load frontend files
	app.Static("/", "../frontend/lifskill_frontend/dist")

	fmt.Println("Application started successfully!")
  
	// Define routes
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendFile("../frontend/lifskill_frontend/dist/index.html")
	})

	app.Get("/hello", func(c *fiber.Ctx) error {
	  return c.SendString("Hello World")
	})
  
	// about authentication



	app.Listen(":8080")
  }