package handlers

import (
	"my-fiber-app/database"
	"my-fiber-app/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// getUserID: ฟังก์ชันช่วยสำหรับดึง User ID จาก Token ที่ส่งมากับ Request
func getUserID(c *fiber.Ctx) uint {
	userToken := c.Locals("user").(*jwt.Token)
	claims := userToken.Claims.(jwt.MapClaims)
	// แปลงค่า user_id จาก float64 (ค่าเริ่มต้นของ JWT) เป็น uint
	return uint(claims["user_id"].(float64))
}

// AddToCart: เพิ่มสินค้าลงในตะกร้าของผู้ใช้
func AddToCart(c *fiber.Ctx) error {
	userID := getUserID(c)

	type CartInput struct {
		BookID   uint `json:"book_id"`
		Quantity int  `json:"quantity"`
	}
	input := new(CartInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
	}

	// 1. ตรวจสอบจำนวนสินค้าที่ส่งมา
	if input.Quantity <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "จำนวนสินค้าต้องมากกว่า 0"})
	}

	// 2. ตรวจสอบว่ามีหนังสือจริงและสต็อกเพียงพอไหม
	var book models.Book
	if err := database.DB.First(&book, input.BookID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบหนังสือที่ต้องการ"})
	}

	if book.Stock < input.Quantity {
		return c.Status(400).JSON(fiber.Map{"error": "จำนวนสินค้าในคลังไม่พอ"})
	}

	// 3. ตรวจสอบว่าเคยมีในตะกร้าแล้วหรือยัง
	var cartItem models.CartItem
	result := database.DB.Where("user_id = ? AND book_id = ?", userID, input.BookID).First(&cartItem)

	if result.Error == nil {
		// ถ้ามีอยู่แล้วให้บวกเพิ่ม
		cartItem.Quantity += input.Quantity
		database.DB.Save(&cartItem)
	} else {
		// ถ้ายังไม่มีให้สร้างใหม่
		newItem := models.CartItem{
			UserID:   userID,
			BookID:   input.BookID,
			Quantity: input.Quantity,
		}
		database.DB.Create(&newItem)
	}

	return c.JSON(fiber.Map{"message": "เพิ่มสินค้าลงตะกร้าสำเร็จ"})
}

// GetCart: ดึงรายการสินค้าทั้งหมดในตะกร้าของผู้ใช้คนนั้นๆ
func GetCart(c *fiber.Ctx) error {
	userID := getUserID(c)
	var cartItems []models.CartItem

	// ใช้ Preload("Book") เพื่อดึงรายละเอียดข้อมูลหนังสือมาพร้อมกัน
	if err := database.DB.Where("user_id = ?", userID).Preload("Book").Find(&cartItems).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถดึงข้อมูลตะกร้าได้"})
	}

	return c.JSON(cartItems)
}

// DeleteCartItem: ลบสินค้าที่ต้องการออกจากตะกร้า
func DeleteCartItem(c *fiber.Ctx) error {
	userID := getUserID(c)
	itemID := c.Params("id") // รับ ID ของรายการในตะกร้า (CartItem ID)

	// ลบโดยตรวจสอบว่าเป็นของเจ้าของ User จริงๆ เพื่อความปลอดภัย
	result := database.DB.Where("id = ? AND user_id = ?", itemID, userID).Delete(&models.CartItem{})

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบสินค้าในตะกร้า"})
	}

	return c.JSON(fiber.Map{"message": "ลบสินค้าออกจากตะกร้าสำเร็จ"})
}

// UpdateCartItem: อัปเดตจำนวนสินค้าในตะกร้า (กำหนดค่าทับลงไปเลย)
func UpdateCartItem(c *fiber.Ctx) error {
	userID := getUserID(c)
	itemID := c.Params("id") // รับ ID ของรายการในตะกร้า (CartItem ID)

	type UpdateInput struct {
		Quantity int `json:"quantity"`
	}
	input := new(UpdateInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
	}

	if input.Quantity <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "จำนวนสินค้าต้องมากกว่า 0"})
	}

	var cartItem models.CartItem
	// ค้นหาด้วย ID ของรายการเอง จะแม่นยำกว่า
	result := database.DB.Where("id = ? AND user_id = ?", itemID, userID).First(&cartItem)

	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบสินค้าในตะกร้า"})
	}

	// อัปเดตจำนวนเป็นค่าใหม่ที่ส่งมา
	cartItem.Quantity = input.Quantity
	if err := database.DB.Save(&cartItem).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถบันทึกข้อมูลได้"})
	}

	return c.JSON(fiber.Map{
		"message":  "อัปเดตจำนวนสินค้าสำเร็จ",
		"quantity": cartItem.Quantity,
	})
}
