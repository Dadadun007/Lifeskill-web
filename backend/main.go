package main

import (
	"github.com/gofiber/fiber/v2"
	// "github.com/dadadun/lifskill/user"
)

func main() {
	app := fiber.New()
  
	app.Get("/hello", func(c *fiber.Ctx) error {
	  return c.SendString("Hello World")
	})
  
	app.Listen(":8080")
  }