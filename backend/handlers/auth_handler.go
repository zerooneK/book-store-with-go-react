package handlers

import (
	"os"
	"time"

	"my-fiber-app/database"
	"my-fiber-app/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// SignUp: ฟังก์ชันสำหรับลงทะเบียนผู้ใช้ใหม่
func SignUp(c *fiber.Ctx) error {
	// 1. รับข้อมูลจาก Request Body และตรวจสอบความถูกต้อง
	user := new(models.User)
	if err := c.BodyParser(user); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
	}

	// 2. เข้ารหัสรหัสผ่าน (Hashing) เพื่อความปลอดภัย
	// ใช้ bcrypt ในการแปลงรหัสผ่านจริงให้เป็นรหัสที่เดาไม่ได้
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 14)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถจัดการรหัสผ่านได้"})
	}
	user.Password = string(hashedPassword)

	// 3. บันทึกข้อมูลผู้ใช้ลงในฐานข้อมูล
	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถสร้างผู้ใช้ได้ (อีเมลนี้อาจมีในระบบแล้ว)"})
	}

	// 4. ตอบกลับผลการสมัคร (ไม่ส่งรหัสผ่านกลับไป)
	return c.JSON(fiber.Map{
		"message": "สมัครสมาชิกสำเร็จ",
		"email":   user.Email,
		"name":    user.Name,
	})
}

// Login: ฟังก์ชันสำหรับเข้าสู่ระบบ
func Login(c *fiber.Ctx) error {
	// 1. รับข้อมูล Login (Email & Password)
	type LoginInput struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	input := new(LoginInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง"})
	}

	// 2. ค้นหาผู้ใช้จาก Email ในฐานข้อมูล
	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		// แจ้งเตือนแบบกลางๆ เพื่อความปลอดภัย
		return c.Status(401).JSON(fiber.Map{"error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"})
	}

	// 3. ตรวจสอบรหัสผ่านที่กรอกมากับรหัสผ่านหน้าตาประหลาดในฐานข้อมูล
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"})
	}

	// 4. เมื่อเข้าสู่ระบบสำเร็จ จะทำการสร้าง JWT Token (บัตรผ่านดิจิทัล)
	claims := jwt.MapClaims{
		"user_id": user.ID,                               // ระบุ ID ของผู้ใช้
		"email":   user.Email,                            // ระบุ Email
		"exp":     time.Now().Add(time.Hour * 72).Unix(), // กำหนดอายุการใช้งาน 3 วัน
	}

	// สร้าง Object สำหรับ Token และเซ็นชื่อยืนยันด้วย Secret Key จาก .env
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถสร้างบัตรผ่านได้"})
	}

	// 5. ส่ง Token และข้อมูลเบื้องต้นกลับไปให้ผู้ใช้เก็บไว้ใช้งาน
	return c.JSON(fiber.Map{
		"message": "เข้าสู่ระบบสำเร็จ",
		"token":   t,
		"role":    user.Role,
		"name":    user.Name,
	})
}
