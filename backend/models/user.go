package models

import "gorm.io/gorm"

type User struct {
    gorm.Model
    Email    string `gorm:"unique;not null" json:"email"`
    Password string `gorm:"not null" json:"-"` // ใส่ "-" เพื่อไม่ให้หลุดออกไปทาง API
    Name     string `json:"name"`
    Role     string `json:"role" gorm:"default:'user'"`
}