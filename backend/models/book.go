package models

import "gorm.io/gorm"

// ชื่อ Struct ต้องตัวใหญ่ (Book) เพื่อให้ไฟล์อื่นเรียกใช้ได้
type Book struct {
    gorm.Model
    Title  string `json:"title" validate:"required,min=3"`
    Author string `json:"author"`
    Price  int    `json:"price" validate:"required,gte=0"`
    ImageURL string `json:"image_url"`
    Stock    int    `json:"stock" gorm:"default:0"`
    Description string `json:"description"`
}