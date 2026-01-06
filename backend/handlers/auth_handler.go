package handlers

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
    "github.com/gofiber/fiber/v2"
    "golang.org/x/crypto/bcrypt"
    "my-fiber-app/database"
    "my-fiber-app/models"
)

func SignUp(c *fiber.Ctx) error {
    // 1. รับค่าจาก Body
	//สร้างอ๊อบเจคมาเก็บค่า pointer ที่ชี้ไปยัง struct User
    user := new(models.User)
	//ทำการเช็ครูปแบบของข้อมูลที่รับเข้ามาว่าตรงตาม struct ที่สร้างไว้หรือไม่
    if err := c.BodyParser(user); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
    }

    // 2. Hash Password (บดรหัสผ่านให้เป็นภาษาต่างดาว)
    // ค่า 14 คือ cost (ความยากในการบด) ยิ่งเยอะยิ่งปลอดภัยแต่ยิ่งช้า (10-14 กำลังดี)
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 14)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Could not hash password"})
    }
    
    // เอาสิ่งที่ hash แล้ว ยัดกลับใส่ user
    user.Password = string(hashedPassword)

    // 3. บันทึกลง Database
    // ถ้าอีเมลซ้ำ GORM จะฟ้อง Error กลับมา
    if err := database.DB.Create(&user).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Could not create user (Email might exist)"})
    }

    // 4. ส่งค่ากลับ (ห้ามส่ง Password กลับไปเด็ดขาด!)
    return c.JSON(fiber.Map{
        "message": "User created successfully",
        "email":   user.Email,
        "name":    user.Name,
    })
}

func Login(c *fiber.Ctx) error {
    // 1. รับค่า Email & Password จาก User
    type LoginInput struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }
	//สร้างอ๊อบเจคที่เก็บค่า pointer ที่ชี้ไปยัง struct LoginInput
	//ทำการเช็ครูปแบบของข้อมูลที่รับเข้ามาว่าตรงตาม struct ที่สร้างไว้หรือไม่
    input := new(LoginInput)
    if err := c.BodyParser(input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
    }

    // 2. ค้นหา User ใน Database ด้วย Email
    var user models.User
    // ถ้าหาไม่เจอ (.Error != nil) แปลว่าไม่มีอีเมลนี้ในระบบ
    if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
        return c.Status(401).JSON(fiber.Map{"error": "User not found"}) // 401 Unauthorized
    }

    // 3. ตรวจสอบรหัสผ่าน (เช็คว่า Password ดิบ ตรงกับ Hash ใน DB ไหม)
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
        return c.Status(401).JSON(fiber.Map{"error": "Incorrect password"})
    }

    // --- ถ้าผ่านมาถึงตรงนี้ แปลว่า Login สำเร็จ! มาออกบัตรผ่านกัน ---

    // 4. สร้าง JWT Token
    // Claims คือข้อมูลที่จะฝังอยู่ใน Token (เช่น UserID, วันหมดอายุ)
    claims := jwt.MapClaims{
        "user_id": user.ID,                       // ฝัง ID ไว้จะได้รู้ว่าใคร
        "email":   user.Email,                    // ฝัง Email
        "exp":     time.Now().Add(time.Hour * 72).Unix(), // หมดอายุใน 72 ชั่วโมง
    }

    // สร้าง Token object
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

    // เซ็นชื่อกำกับด้วย Secret Key (จาก .env)
    t, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Could not login"})
    }

    // 5. ส่ง Token กลับไปให้ User
    return c.JSON(fiber.Map{
        "message": "Login success",
        "token":   t,
    })
}