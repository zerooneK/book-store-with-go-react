// Cart.jsx
import React from 'react';
import './App.css'; // ใช้ CSS หลัก

const Cart = ({ cartItems, onClose, onRemove }) => {
  // คำนวณราคารวม
  const totalPrice = cartItems.reduce((sum, item) => sum + ((item.book?.price || 0) * item.quantity), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cart-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">🛒 ตะกร้าอวกาศของคุณ</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="cart-items-container">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
              <p style={{ fontSize: '3rem' }}>🌑</p>
              <p>ตะกร้ายังว่างเปล่า...</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.ID} className="cart-item">
                {/* รูปหนังสือ */}
                <div className="cart-item-img">
                  <img
                    src={item.book?.image_url || "https://via.placeholder.com/150"}
                    alt={item.book?.title || "Book"}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150" }}
                  />
                </div>

                {/* ข้อมูล */}
                <div className="cart-item-info">
                  <h4>{item.book?.title || 'Unknown Book'}</h4>
                  <p className="cart-item-price">฿{(item.book?.price || 0).toLocaleString()} x {item.quantity}</p>
                </div>

                {/* ปุ่มลบ */}
                <button
                  className="btn-danger-sm"
                  onClick={() => onRemove(item.ID)}
                >
                  ลบ
                </button>
              </div>
            ))
          )}
        </div>

        {/* ส่วนสรุปยอด */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>รวมทั้งหมด:</span>
              <span className="total-price">฿{totalPrice.toLocaleString()}</span>
            </div>
            <button className="btn-primary checkout-btn" onClick={() => alert('ฟีเจอร์ชำระเงินยังไม่เปิดให้บริการ 🚧')}>
              🚀 สั่งซื้อสินค้า
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;