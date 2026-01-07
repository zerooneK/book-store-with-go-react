package models

import "gorm.io/gorm"

type CartItem struct {
    gorm.Model
    UserID   uint   `json:"user_id"`
    BookID   uint   `json:"book_id"`
    // Preload: ดึงข้อมูลหนังสือมาโชว์ด้วย (ชื่อ, ราคา, รูป)
    Book     Book   `json:"book" gorm:"foreignKey:BookID"` 
    Quantity int    `json:"quantity" gorm:"default:1"`
}