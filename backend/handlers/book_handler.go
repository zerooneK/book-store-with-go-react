package handlers

import (
	"my-fiber-app/database" // เรียกใช้ DB
	"my-fiber-app/models"   // เรียกใช้ Struct

	"github.com/gofiber/fiber/v2"
)

// ฟังก์ชันสำหรับดึงหนังสือทั้งหมด
func GetBooks(c *fiber.Ctx) error {
	var books []models.Book
	database.DB.Find(&books) // ใช้ DB จาก package database
	return c.JSON(books)
}

// ฟังก์ชันสำหรับเพิ่มหนังสือ
func CreateBook(c *fiber.Ctx) error {
	book := new(models.Book)
	// 1. แกะค่าจาก Body
	if err := c.BodyParser(book); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}
	// 2. บันทึกลงฐานข้อมูล และตรวจสอบ Error
	if err := database.DB.Create(&book).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create book"})
	}
	// 3. ส่งข้อมูลหนังสือที่สร้างเสร็จกลับไป
	return c.JSON(book)
}

// ฟังก์ชันแก้ไขข้อมูลหนังสือ (PUT)
func UpdateBook(c *fiber.Ctx) error {
	// 1. รับ ID จาก URL (เช่น /book/1)
	id := c.Params("id")
	var book models.Book

	// 2. เช็คก่อนว่ามีหนังสือเล่มนี้ไหม?
	if result := database.DB.First(&book, id); result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Book not found",
		})
	}

	// 3. เตรียมตัวแปรรับค่าที่ส่งมาแก้ไข (เฉพาะ field ที่อนุญาต)
	type UpdateBookInput struct {
		Title    string `json:"title"`
		Author   string `json:"author"`
		Price    int    `json:"price"`
		Description string `json:"description"`
		ImageURL string `json:"image_url"`
		Stock    int    `json:"stock"`
	}
	var updateData UpdateBookInput

	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid input",
		})
	}

	// 4. สั่งอัปเดต (ใช้ Select เพื่อให้อัปเดตค่าที่เป็น 0 หรือค่าว่างได้ด้วย)
	if err := database.DB.Model(&book).Select("Title", "Author", "Price", "ImageURL", "Stock", "Description").Updates(models.Book{
		Title:    updateData.Title,
		Author:   updateData.Author,
		Price:    updateData.Price,
		ImageURL: updateData.ImageURL,
		Stock:    updateData.Stock,
		Description: updateData.Description,
	}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not update book"})
	}

	// 5. ส่งข้อมูลล่าสุดกลับไป
	return c.JSON(book)
}

// ฟังก์ชันลบหนังสือ (DELETE)
func DeleteBook(c *fiber.Ctx) error {
	// 1. รับ ID
	id := c.Params("id")
	var book models.Book

	// 2. เช็คว่ามีไหม (ถ้าไม่มีจะได้บอก User ถูก)
	if result := database.DB.First(&book, id); result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Book not found",
		})
	}

	// 3. สั่งลบ (Soft Delete เพราะใช้ gorm.Model)
	database.DB.Delete(&book)

	return c.JSON(fiber.Map{
		"message": "Book deleted successfully",
	})
}
