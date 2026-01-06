package handlers

import (

    "github.com/gofiber/fiber/v2"
    "my-fiber-app/database" // เรียกใช้ DB
    "my-fiber-app/models"   // เรียกใช้ Struct
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
    if err := c.BodyParser(book); err != nil {
        return c.Status(400).JSON(err.Error())
    }
    database.DB.Create(&book)
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
        Title  string `json:"title"`
        Author string `json:"author"`
        Price  int    `json:"price"`
        ImageURL string `json:"image_url"`
    }
    var updateData UpdateBookInput

    if err := c.BodyParser(&updateData); err != nil {
        return c.Status(400).JSON(fiber.Map{
            "error": "Invalid input",
        })
    }

    // 4. สั่งอัปเดต (GORM จะแก้เฉพาะค่าที่ไม่ใช่ค่าว่าง/ค่าเริ่มต้น)
    database.DB.Model(&book).Updates(models.Book{
        Title:  updateData.Title,
        Author: updateData.Author,
        Price:  updateData.Price,
        ImageURL: updateData.ImageURL,
    })

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