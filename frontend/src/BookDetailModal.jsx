// BookDetailModal.jsx
import React, { useState } from 'react';
import './BookDetailModal.css'; // ปรับเปลี่ยนเป็น CSS เฉพาะส่วน

const BookDetailModal = ({ book, onClose, onConfirm }) => {
    // 1. Defensive Check: ถ้าไม่มีข้อมูลหนังสือ ไม่ต้องแสดงผล Modal
    if (!book) return null;

    // State สำหรับจำนวนสินค้า (เริ่มต้นที่ 1)
    const [quantity, setQuantity] = useState(1);

    // ฟังก์ชันเพิ่มจำนวน (ห้ามเกิน Stock)
    const handleIncrease = () => {
        if (quantity < (book?.stock || 0)) {
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
            {/* e.stopPropagation() เพื่อไม่ให้คลิกที่เนื้อหาแล้วหน้าต่างปิดลง */}
            <div className="modal-content book-detail-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>✕</button>

                <div className="book-detail-layout">
                    {/* ฝั่งซ้าย: รูปภาพประกอบหนังสือ */}
                    <div className="book-detail-image">
                        <img
                            src={book?.image_url || "https://via.placeholder.com/300x450"}
                            alt={book?.title || "Book Image"}
                        />
                    </div>

                    {/* ฝั่งขวา: ข้อมูลรายละเอียดหนังสือ */}
                    <div className="book-detail-info">
                        <h2 className="detail-title">{book?.title || "ไม่มีชื่อหนังสือ"}</h2>
                        <p className="detail-author">✍️ {book?.author || "ไม่ระบุผู้แต่ง"}</p>

                        <div className="detail-description">
                            <h4>เรื่องย่อ:</h4>
                            <p>{book?.description || "ยังไม่มีรายละเอียดสำหรับหนังสือเล่มนี้..."}</p>
                        </div>

                        <div className="detail-price-section">
                            <span className="detail-price">💎 ฿{(book?.price || 0).toLocaleString()}</span>
                            <span className="detail-stock">เหลือ {book?.stock || 0} เล่ม</span>
                        </div>

                        {/* ส่วนเลือกจำนวนที่ต้องการซื้อ */}
                        <div className="quantity-selector">
                            <button onClick={handleDecrease} disabled={quantity <= 1}>-</button>
                            <span className="quantity-display">{quantity}</span>
                            <button onClick={handleIncrease} disabled={quantity >= (book?.stock || 0)}>+</button>
                        </div>

                        {/* ปุ่มยืนยันการเพิ่มลงตะกร้า */}
                        <button
                            className="btn-primary confirm-add-btn"
                            onClick={() => onConfirm(book?.ID, quantity)}
                        >
                            🛒 ยืนยันใส่ตะกร้า (฿{((book?.price || 0) * quantity).toLocaleString()})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailModal;