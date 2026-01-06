package main

import (
    "log"
    "os"
    
    "github.com/gofiber/fiber/v2"
    "github.com/joho/godotenv"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
    jwtware "github.com/gofiber/contrib/jwt"
    
    "my-fiber-app/database" // import database
    "my-fiber-app/handlers" // import handlers
)

func main() {
    // 1. โหลด .env
    if err := godotenv.Load(); err != nil {
        log.Fatal("Error loading .env file")
    }

    // 2. เชื่อมต่อฐานข้อมูล
    database.ConnectDb()

    // 3. สร้าง App
    app := fiber.New()

    app.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:5173", // หรือใส่ "*" เพื่ออนุญาตทุกเว็บ
        AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
    }))

    // 3.1 Logger: ช่วยปริ้น Log สวยๆ ใน Terminal ว่ามีใครยิงอะไรมาบ้าง
    app.Use(logger.New())

    // 3.2 CORS: อนุญาตให้เว็บอื่นยิงมาหาเราได้ (สำคัญมากถ้าทำ Frontend)
    // ถ้าไม่ใส่ Frontend (Port 8080) จะยิงมาหา Backend (Port 3000) ไม่ได้
    app.Use(cors.New())

    // ==========================================
    // 🟢 โซนสาธารณะ (Public) - ไม่ต้องใช้ Token
    // ==========================================
    // 4. กำหนดเส้นทาง (Routes) สั้นๆ สวยๆ
    app.Get("/books", handlers.GetBooks)
    app.Post("/signup", handlers.SignUp)
    app.Post("/login", handlers.Login)

    // ==========================================
    // 🔒 โซนหวงห้าม (Private) - ต้องมี Token
    // ==========================================
    // สร้าง JWT Middleware
    // มันจะคอยดักฟัง Header ที่ชื่อ "Authorization: Bearer <token>"
    // สร้าง JWT Middleware
    jwtMiddleware := jwtware.New(jwtware.Config{
        SigningKey: jwtware.SigningKey{Key: []byte(os.Getenv("JWT_SECRET"))},
        
        // 👉 เพิ่มส่วนนี้เข้าไปครับ (Error Handler)
        ErrorHandler: func(c *fiber.Ctx, err error) error {
            // บังคับให้ตอบ 401 Unauthorized เสมอ พร้อมข้อความ Error
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "error": "Unauthorized: " + err.Error(),
            })
        },
    })
    // เอา Route ที่ต้องการล็อค มาใส่ไว้ใต้ Middleware นี้ หรือใช้ Group
    // วิธีใช้ Group (แนะนำ):
    api := app.Group("/admin", jwtMiddleware)
    api.Post("/book", handlers.CreateBook)
    api.Put("/book/:id", handlers.UpdateBook)
    api.Delete("/book/:id", handlers.DeleteBook) 

    // 5. รัน
    app.Listen(":3000")
}