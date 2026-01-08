// BookDetailModal.jsx
import React, { useState } from 'react';
import './App.css'; // ใช้ CSS เดียวกัน

const BookDetailModal = ({ book, onClose, onConfirm }) => {
    // State สำหรับจำนวนสินค้า (เริ่มต้นที่ 1)
    const [quantity, setQuantity] = useState(1);

    // ฟังก์ชันเพิ่มจำนวน (ห้ามเกิน Stock)
    const handleIncrease = () => {
        if (quantity < book.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    // ฟังก์ชันลดจำนวน (ห้ามต่ำกว่า 1)
    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content book-detail-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>✕</button>
                
                <div className="book-detail-layout">
                    {/* ฝั่งซ้าย: รูปภาพ */}
                    <div className="book-detail-image">
                        <img 
                            src={book.image_url || "https://via.placeholder.com/300x450"} 
                            alt={book.title} 
                        />
                    </div>

                    {/* ฝั่งขวา: ข้อมูล */}
                    <div className="book-detail-info">
                        <h2 className="detail-title">{book.title}</h2>
                        <p className="detail-author">✍️ {book.author}</p>
                        
                        <div className="detail-description">
                            <h4>เรื่องย่อ:</h4>
                            <p>{book.description || "ยังไม่มีรายละเอียดสำหรับหนังสือเล่มนี้..."}</p>
                        </div>

                        <div className="detail-price-section">
                            <span className="detail-price">💎 ฿{book.price.toLocaleString()}</span>
                            <span className="detail-stock">เหลือ {book.stock} เล่ม</span>
                        </div>

                        {/* ตัวเลือกจำนวนสินค้า */}
                        <div className="quantity-selector">
                            <button onClick={handleDecrease} disabled={quantity <= 1}>-</button>
                            <span className="quantity-display">{quantity}</span>
                            <button onClick={handleIncrease} disabled={quantity >= book.stock}>+</button>
                        </div>

                        {/* ปุ่มยืนยัน */}
                        <button 
                            className="btn-primary confirm-add-btn"
                            onClick={() => onConfirm(book.ID, quantity)}
                        >
                            🛒 ยืนยันใส่ตะกร้า (฿{(book.price * quantity).toLocaleString()})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailModal;