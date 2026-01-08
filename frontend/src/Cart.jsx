// Cart.jsx
import React from 'react';
import Swal from 'sweetalert2';
import './Cart.css'; // ปรับมาใช้ CSS เฉพาะส่วนของตะกร้า

const Cart = ({ cartItems, onClose, onRemove }) => {
  // คำนวณราคารวมทั้งหมดในตะกร้า
  const totalPrice = cartItems.reduce((sum, item) => sum + ((item.book?.price || 0) * item.quantity), 0);

  // ฟังก์ชันจำลองการชำระเงิน (ใช้นีออนสไตล์ SweetAlert2)
  const handleCheckout = () => {
    Swal.fire({
      icon: 'info',
      title: 'กำลังพัฒนา...',
      text: 'ฟีเจอร์ชำระเงินยังไม่เปิดให้บริการในขณะนี้ 🚧',
      background: '#1a1a2e',
      color: '#fff',
      confirmButtonColor: '#667eea',
      confirmButtonText: 'รับทราบ!',
      backdrop: `rgba(0,0,123,0.4)`
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* ป้องกันการคลิกเนื้อหาภายในแล้ว Modal ปิดลง */}
      <div className="modal-content cart-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">🛒 ตะกร้าอวกาศของคุณ</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="cart-items-container">
          {/* กรณีตะกร้าว่างเปล่า */}
          {cartItems.length === 0 ? (
            <div className="empty-cart-state">
              <p className="empty-cart-icon">🌑</p>
              <p>ตะกร้ายังว่างเปล่า...</p>
            </div>
          ) : (
            // รายการสินค้าในตะกร้า
            cartItems.map((item) => (
              <div key={item.ID} className="cart-item">
                {/* รูปภาพพรีวิวหนังสือ */}
                <div className="cart-item-img">
                  <img
                    src={item.book?.image_url || "https://via.placeholder.com/150"}
                    alt={item.book?.title || "Book Preview"}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150" }}
                  />
                </div>

                {/* รายละเอียดหนังสือในตะกร้า */}
                <div className="cart-item-info">
                  <h4>{item.book?.title || 'Unknown Book'}</h4>
                  <p className="cart-item-price">฿{(item.book?.price || 0).toLocaleString()} x {item.quantity}</p>
                </div>

                {/* ปุ่มลบสินค้าออกจากตะกร้า */}
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

        {/* ส่วนสรุปยอดเงินและปุ่มสั่งซื้อ (แสดงเมื่อมีสินค้าเท่านั้น) */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>รวมทั้งหมด:</span>
              <span className="total-price">฿{totalPrice.toLocaleString()}</span>
            </div>
            <button className="btn-primary checkout-btn" onClick={handleCheckout}>
              🚀 สั่งซื้อสินค้า
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;