package database

import (
    "fmt"
    "log"
    "os"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "my-fiber-app/models"
	"gorm.io/gorm/logger"
)

// ตัวแปร Global เอาไว้ให้หน้านั้นเรียกใช้
var DB *gorm.DB

//function สำหรับเชื่อมต่อฐานข้อมูล
func ConnectDb() {
    //เก็บข้อมูลที่ใช้สำหรับเชื่อมต่อฐานไว้ที่ตัวแปร dsn
    dsn := fmt.Sprintf(
        "host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Bangkok",
        os.Getenv("DB_HOST"),
        os.Getenv("DB_USER"),
        os.Getenv("DB_PASSWORD"),
        os.Getenv("DB_NAME"),
        os.Getenv("DB_PORT"),
    )

    //ทำการสร้างอ๊อบเจคขึ้นมาเพื่อเก็บข้อมูลการเชื่อมต่อฐานข้อมูลและ error
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    //ถ้าเกิด error ให้ทำการแสดง log error แจ้ง user
    if err != nil {
        log.Fatal("Failed to connect to database. \n", err)
    }

    log.Println("connected")
    //ทำการแสดง Log info ทุกอย่าง
    db.Logger = logger.Default.LogMode(logger.Info)

    // Auto Migrate ย้ายมาทำตรงนี้
    log.Println("running migrations")
    //สร้าง table บน DB ตาม struct ที่สร้างไว้
    db.AutoMigrate(&models.Book{})
    db.AutoMigrate(&models.User{})
    db.AutoMigrate(&models.CartItem{})

    // เก็บค่า connection ไว้ในตัวแปร Global
    DB = db
}