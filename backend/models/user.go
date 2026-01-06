package models

import "gorm.io/gorm"

type User struct {
    gorm.Model
    Email    string `gorm:"unique" json:"email" validate:"required,email"` // gorm:"unique" คือห้ามอีเมลซ้ำ
    Password string `json:"password" validate:"required,min=8"`
    Name     string `json:"name" validate:"required,min=4"`
}