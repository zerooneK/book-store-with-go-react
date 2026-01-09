package main

import (
	"log"
	"os"

	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"

	"my-fiber-app/database" // เชื่อมต่อฐานข้อมูล
	"my-fiber-app/handlers" // จัดการ API
)

func main() {
	// 1. โหลดค่าการตั้งค่าจากไฟล์ .env
	if err := godotenv.Load(); err != nil {
		log.Println("คำเตือน: ไม่พบไฟล์ .env ระบบจะใช้ค่าเริ่มต้นแทน")
	}

	// 2. เชื่อมต่อฐานข้อมูล (PostgreSQL) และ Migrate ตาราง
	database.ConnectDb()

	// 3. เริ่มต้นสร้างแอปพลิเคชัน Fiber
	app := fiber.New()

	// 4. ตั้งค่า Middleware ต่างๆ
	// CORS: อนุญาตให้เว็บหน้าบ้าน (Frontend) รับส่งข้อมูลกับ API
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173" // ค่าเริ่มต้นสำหรับ Development
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins: frontendURL,
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Logger: ปริ้น Log การเรียกใช้งาน API ลงใน Terminal
	app.Use(logger.New())

	// 5. กำหนดเส้นทาง API (Routes)

	// --- โซนสาธารณะ (Public): ไม่ต้องล็อกอิน ---
	app.Get("/books", handlers.GetBooks)
	app.Post("/signup", handlers.SignUp)
	app.Post("/login", handlers.Login)

	// --- ตั้งค่าระบบตรวจสอบบัตรผ่าน (JWT Middleware) ---
	jwtMiddleware := jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(os.Getenv("JWT_SECRET"))},
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "ไม่ได้รับอนุญาต: บัตรผ่านไม่ถูกต้องหรือหมดอายุ",
			})
		},
	})

	// --- โซนหวงห้าม (Private): ต้องล็อกอินก่อนเข้าถึง ---

	// กลุ่มผู้จัดการระบบ (Admin): จัดการคลังหนังสือ
	adminApi := app.Group("/admin", jwtMiddleware)
	adminApi.Post("/book", handlers.CreateBook)
	adminApi.Put("/book/:id", handlers.UpdateBook)
	adminApi.Delete("/book/:id", handlers.DeleteBook)

	// กลุ่มผู้ใช้งานทั่วไป (User/API): จัดการตะกร้าสินค้า
	userApi := app.Group("/api", jwtMiddleware)
	userApi.Post("/cart", handlers.AddToCart)
	userApi.Get("/cart", handlers.GetCart)
	userApi.Put("/cart/:id", handlers.UpdateCartItem)
	userApi.Delete("/cart/:id", handlers.DeleteCartItem)

	// 6. รันเซิร์ฟเวอร์ตามพอร์ตที่กำหนด
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000" // ค่าเริ่มต้นถ้าไม่ได้ระบุใน .env
	}

	log.Printf("🚀 เซิร์ฟเวอร์กำลังทำงานที่พอร์ต %s", port)
	log.Fatal(app.Listen(":" + port))
}
