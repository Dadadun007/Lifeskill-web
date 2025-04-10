package database

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
    UserID   uint   `gorm:"primaryKey;autoIncrement" json:"user_id"`
    Username string `gorm:"size:50;not null;unique" json:"username"`
    Password string `gorm:"size:255;not null" json:"password"`
    Email    string `gorm:"size:100;not null;unique" json:"email"`
    Age      int    `json:"age"`
    Sex      string `gorm:"size:10" json:"sex"`
}

