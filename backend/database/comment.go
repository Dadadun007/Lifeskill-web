package database

import (
	"gorm.io/gorm"

)

type Comment struct {
	gorm.Model
	CommentContent string    `gorm:"type:text;not null;column:comment_content"`
	UserID         uint      `gorm:"not null"`
	PostID         uint      `gorm:"not null"`
	ParentID       *uint     `gorm:"default:null"` // For reply functionality

}