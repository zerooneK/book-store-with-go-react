import React from 'react';
import './BookCard.css';

const BookCard = ({ book, onDelete, onEdit, isAdmin }) => {
  // 1. จัดการรูปภาพ (ถ้าไม่มีรูปให้ใช้ Placeholder)
  const displayImage = book.image_url ? book.image_url : "https://via.placeholder.com/150";

  // 2. เช็คสต็อก (ถ้า stock เป็น 0 ถือว่าหมด)
  // หมายเหตุ: ต้องมั่นใจว่า Backend ส่งค่า stock มาแล้ว (ถ้ายังไม่ส่ง ค่าจะเป็น undefined หรือ 0)
  const isOutOfStock = book.stock === 0;

  return (
    // ถ้าของหมด ให้เติม class 'out-of-stock' เพื่อทำสีจางๆ
    <div className={`book-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      
      {/* ดาวประดับมุมขวาบน (Decoration) */}
      <div className="card-stars">
        <span className="star"></span>
        <span className="star"></span>
        <span className="star"></span>
      </div>

      <div className="card-content">
        {/* ส่วนแสดงรูปภาพ */}
        <div className="card-image-container">
          <img 
            src={displayImage} 
            alt={book.title} 
            style={{
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              borderRadius: '8px'
            }} 
            // ถ้ารูปโหลดไม่ได้ ให้กลับไปใช้รูป Placeholder
            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150" }} 
          />
        </div>

        {/* ข้อมูลหนังสือ */}
        <h3 className="card-title">{book.title}</h3>
        <p className="card-author">{book.author}</p>
        
        {/* แถวแสดง ราคา และ จำนวนคงเหลือ */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', width: '100%'}}>
           <p className="card-price">฿{book.price?.toLocaleString()}</p>
           
           {/* ป้ายแสดงสต็อก */}
           <span style={{
             fontSize: '0.8rem', 
             fontWeight: 'bold',
             color: isOutOfStock ? '#ff4b4b' : '#4cd964', // แดงถ้าหมด เขียวถ้ามี
             border: `1px solid ${isOutOfStock ? '#ff4b4b' : '#4cd964'}`,
             padding: '4px 8px',
             borderRadius: '12px',
             background: 'rgba(0,0,0,0.2)'
           }}>
             {isOutOfStock ? 'หมด' : `เหลือ ${book.stock} เล่ม`}
           </span>
        </div>
      </div>

      {/* --- ส่วนปุ่มกด (Action Buttons) --- */}
      {isAdmin ? (
        // 🅰️ สำหรับแอดมิน: ปุ่มแก้ไข และ ลบ
        <div className="action-btn-container">
          <button 
            className="action-btn edit-btn"
            onClick={() => onEdit(book)}
            title="แก้ไขข้อมูล"
          >
            <span>✏️ แก้ไข</span>
          </button>

          <button
            className="action-btn delete-btn"
            onClick={() => onDelete(book.ID)}
            title="ลบหนังสือ"
          >
            <span>🗑️ ลบ</span>
          </button>
        </div>
      ) : (
        // 👤 สำหรับลูกค้าทั่วไป: ปุ่มใส่ตะกร้า
        <div className="action-btn-container">
          <button 
            className={`action-btn cart-btn ${isOutOfStock ? 'disabled' : ''}`}
            disabled={isOutOfStock} // ถ้าของหมด ห้ามกด
            onClick={() => alert(`คุณเลือก: ${book.title} (ระบบตะกร้ากำลังมาเร็วๆ นี้!)`)}
          >
            {isOutOfStock ? '❌ สินค้าหมด' : '🛒 ใส่ตะกร้า'}
          </button>
        </div>
      )}

    </div>
  );
};

export default BookCard;