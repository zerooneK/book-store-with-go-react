import React from 'react';
import './BookCard.css';

// 0. กำหนดรูปภาพเริ่มต้นกรณีไม่มีรูปหรือโหลดไม่ได้
const DEFAULT_IMAGE = "https://via.placeholder.com/150";

const BookCard = ({ book, onDelete, onEdit, isAdmin, onAddToCart }) => {
  // 1. จัดการรูปภาพ (ใช้ DEFAULT_IMAGE ถ้าไม่มีข้อมูล)
  const displayImage = book.image_url ? book.image_url : DEFAULT_IMAGE;

  // 2. เช็คสถานะสต็อกสินค้า (หมดเมื่อ <= 0)
  const isOutOfStock = !book.stock || book.stock <= 0;

  return (
    // เพิ่ม class 'out-of-stock' ถ้าของหมด เพื่อลดความเด่นของภาพ
    <div className={`book-card ${isOutOfStock ? 'out-of-stock' : ''}`}>

      {/* ดาวประดับ (Star Decoration) */}
      <div className="card-stars">
        <span className="star"></span>
        <span className="star"></span>
        <span className="star"></span>
      </div>

      <div className="card-content">
        {/* ส่วนรูปภาพหนังสือ */}
        <div className="card-image-container">
          <img
            src={displayImage}
            alt={book.title}
            className="book-image"
            // ถ้ารูปโหลดไม่ได้ ให้เปลี่ยนไปใช้รูปเริ่มต้น
            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE }}
          />
        </div>

        {/* ข้อมูลเนื้อหาหนังสือ */}
        <h3 className="card-title">{book.title}</h3>
        <p className="card-author">{book.author}</p>

        {/* แถวข้อมูล ราคา และ สถานะคงเหลือ */}
        <div className="book-meta-row">
          <p className="card-price">฿{(book.price || 0).toLocaleString()}</p>

          {/* ป้ายแสดงสถานะสต็อก (เปลี่ยนสีตามสถานะ) */}
          <span className={`stock-badge ${isOutOfStock ? 'out' : 'available'}`}>
            {isOutOfStock ? 'หมด' : `เหลือ ${book.stock} เล่ม`}
          </span>
        </div>
      </div>

      {/* --- ส่วนปุ่มจัดการ (Action Buttons) --- */}
      {isAdmin ? (
        // สำหรับแอดมิน: แสดงปุ่มแก้ไขและลบ
        <div className="action-btn-container">
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit(book)}
            title="แก้ไขข้อมูลหนังสือ"
          >
            <span>✏️ แก้ไข</span>
          </button>

          <button
            className="action-btn delete-btn"
            onClick={() => onDelete(book.ID)}
            title="ลบหนังสืออกจากระบบ"
          >
            <span>🗑️ ลบ</span>
          </button>
        </div>
      ) : (
        // สำหรับผู้ใช้งาน: แสดงปุ่มใส่ตะกร้า
        <div className="action-btn-container">
          <button
            className={`action-btn cart-btn ${isOutOfStock ? 'disabled' : ''}`}
            disabled={isOutOfStock}
            onClick={() => onAddToCart(book.ID)}
          >
            {isOutOfStock ? '❌ สินค้าหมด' : '🛒 ใส่ตะกร้า'}
          </button>
        </div>
      )}

    </div>
  );
};

export default BookCard;