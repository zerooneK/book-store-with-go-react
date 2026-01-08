package models

import "gorm.io/gorm"

type CartItem struct {
    gorm.Model
    UserID   uint   `json:"user_id" gorm:"not null"`
    BookID   uint   `json:"book_id" gorm:"not null"`
    Book     Book   `json:"book" gorm:"foreignKey:BookID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"` 
    Quantity int    `json:"quantity" gorm:"default:1"`
}