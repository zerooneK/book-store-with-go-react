// handlers/cart_handler.go
package handlers

import (
	"my-fiber-app/database"
	"my-fiber-app/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// Helper Function: ดึง UserID จาก Token
func getUserID(c *fiber.Ctx) uint {
	userToken := c.Locals("user").(*jwt.Token)
	claims := userToken.Claims.(jwt.MapClaims)
	// แปลงค่า user_id จาก float64 (JWT default) เป็น uint
	return uint(claims["user_id"].(float64))
}

// 1. เพิ่มสินค้าลงตะกร้า
func AddToCart(c *fiber.Ctx) error {
	userID := getUserID(c)

	type CartInput struct {
		BookID   uint `json:"book_id"`
		Quantity int  `json:"quantity"`
	}
	input := new(CartInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// เช็คสต็อกก่อน!
	var book models.Book
	if err := database.DB.First(&book, input.BookID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Book not found"})
	}
	if book.Stock < input.Quantity {
		return c.Status(400).JSON(fiber.Map{"error": "Not enough stock"})
	}

	// เช็คว่า User นี้เคยหยิบเล่มนี้ใส่ตะกร้าหรือยัง?
	var cartItem models.CartItem
	result := database.DB.Where("user_id = ? AND book_id = ?", userID, input.BookID).First(&cartItem)

	if result.Error == nil {
		// กรณีมีอยู่แล้ว -> อัปเดตจำนวน
		cartItem.Quantity += input.Quantity
		database.DB.Save(&cartItem)
	} else {
		// กรณีไม่มี -> สร้างใหม่
		newItem := models.CartItem{
			UserID:   userID,
			BookID:   input.BookID,
			Quantity: input.Quantity,
		}
		database.DB.Create(&newItem)
	}

	return c.JSON(fiber.Map{"message": "Added to cart successfully"})
}

// 2. ดูตะกร้าของฉัน
func GetCart(c *fiber.Ctx) error {
	userID := getUserID(c)
	var cartItems []models.CartItem

	// Preload("Book") คือสั่งให้จอยตารางเอาข้อมูลหนังสือมาด้วย
	database.DB.Where("user_id = ?", userID).Preload("Book").Find(&cartItems)

	return c.JSON(cartItems)
}

// 3. ลบสินค้าจากตะกร้า
func DeleteCartItem(c *fiber.Ctx) error {
	userID := getUserID(c)
	itemID := c.Params("id") // รับ ID ของ CartItem (ไม่ใช่ BookID นะ)

	result := database.DB.Where("id = ? AND user_id = ?", itemID, userID).Delete(&models.CartItem{})
	
	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Item not found"})
	}

	return c.JSON(fiber.Map{"message": "Item removed"})
}