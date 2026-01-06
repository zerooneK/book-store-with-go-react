import React from 'react';
import './BookCard.css';

const BookCard = ({ book, onDelete, onEdit, isAdmin }) => {
  // ตรวจสอบว่ามีลิงก์รูปไหม ถ้าไม่มีให้ใช้รูป Placeholder
  const displayImage = book.image_url ? book.image_url : "https://via.placeholder.com/150";

  return (
    <div className="book-card">
      {/* ดาวประดับมุมขวาบน */}
      <div className="card-stars">
        <span className="star"></span>
        <span className="star"></span>
        <span className="star"></span>
      </div>

      <div className="card-content">
        <div className="card-image-container">
          {/* 🔥 ส่วนที่อัปเดต: แสดงรูปภาพจริงแทนไอคอน */}
          <img
            src={displayImage}
            alt={book.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            // ถ้ารูปโหลดไม่ได้ (ลิงก์เสีย) ให้กลับไปใช้รูป Placeholder
            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150" }}
          />
        </div>

        <h3 className="card-title">{book.title}</h3>
        <p className="card-author">{book.author}</p>
        <p className="card-price">฿{book.price?.toLocaleString()}</p>
      </div>

      {/* Action Buttons based on user role */}
      {isAdmin ? (
        // Admin Mode: แสดงปุ่มแก้ไขและลบ
        <div className="action-btn-container">
          {/* ปุ่มแก้ไข (สีเหลือง/ส้ม) */}
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit(book)}
            title="แก้ไข"
          >
            <span>✏️ แก้ไข</span>
          </button>

          {/* ปุ่มลบ (สีแดง) */}
          <button
            className="action-btn delete-btn"
            onClick={() => onDelete(book.ID)}
            title="ลบ"
          >
            <span>🗑️ ลบ</span>
          </button>
        </div>
      ) : (
        // Guest/User Mode: แสดงปุ่มตะกร้าสีเขียว
        <div className="action-btn-container">
          <button
            className="action-btn cart-btn"
            onClick={() => alert(`เพิ่ม "${book.title}" ลงตะกร้าแล้ว!`)}
            title="เพิ่มลงตะกร้า"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cart-icon">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>เพิ่มลงตะกร้า</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BookCard;