package database

import (
	"gorm.io/gorm"
	
)

type Post struct {
	gorm.Model
	Title             string     `gorm:"size:150;not null"`
	Content           string     `gorm:"type:text;not null"`
	Picture           string     `gorm:"size:255"`
	Like              int        `gorm:"default:0"`
	RecommendAgeRange string     `gorm:"size:50;column:recommend_age_range"`
	Status            string     `gorm:"size:20;default:'pending'"`
	ApprovedUsers     int		 `gorm:"default:0;column:Total_Approved_Users"`
	UserID            uint       `gorm:"not null"`
	User   			  User 		 `gorm:"foreignKey:UserID;references:ID"`
	Categories        []Category `gorm:"many2many:post_categories;"`
}

