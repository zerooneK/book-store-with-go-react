import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import Cart from './Cart'
import './App.css'
import BookCard from './BookCard'
import sectionIcon from './assets/Icon.png'

function App() {
  const [books, setBooks] = useState([])
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [role, setRole] = useState(localStorage.getItem('role') || '')
  const [name, setName] = useState(localStorage.getItem('name') || '')

  // ข้อมูลสำหรับจัดการหนังสือ (เพิ่ม/แก้ไข)
  const [newBook, setNewBook] = useState({ title: '', author: '', price: 0, image_url: '', stock: 0 })

  // สถานะการควบคุมหน้าต่าง Modal และโหมดการทำงาน
  const [showAddModal, setShowAddModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentBookId, setCurrentBookId] = useState(null)

  // ข้อมูลตะกร้าสินค้าและการแสดงผล
  const [cartItems, setCartItems] = useState([])
  const [showCart, setShowCart] = useState(false)

  // โหลดข้อมูลเริ่มต้นและข้อมูลตะกร้าเมื่อเข้าสู่ระบบ
  useEffect(() => {
    fetchBooks()
    if (token) {
      fetchCart()
    }
  }, [token])

  // ดึงรายการหนังสือทั้งหมดจาก API
  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/books')
      setBooks(response.data)
    } catch (error) {
      console.error("โหลดหนังสือไม่สำเร็จ", error)
    }
  }

  // ออกจากระบบ ล้างค่าใน State และ LocalStorage
  const handleLogout = () => {
    setToken('')
    setRole('')
    setName('')
    setCartItems([])
    setShowCart(false)
    localStorage.clear()
    Swal.fire({
      icon: 'info',
      title: 'ออกจากระบบแล้ว',
      timer: 1500,
      showConfirmButton: false,
      background: '#1a1a2e',
      color: '#fff'
    })
  }

  // เปิด Modal เพื่อเพิ่มหนังสือใหม่
  const openAddModal = () => {
    setIsEditing(false)
    setCurrentBookId(null)
    setNewBook({ title: '', author: '', price: 0, image_url: '', stock: 0 })
    setShowAddModal(true)
  }

  // เปิด Modal พร้อมโหลดข้อมูลหนังสือเพื่อแก้ไข
  const handleEditClick = (book) => {
    setIsEditing(true)
    setCurrentBookId(book.ID)
    setNewBook({
      title: book.title,
      author: book.author,
      price: book.price,
      image_url: book.image_url || '',
      stock: book.stock || 0
    })
    setShowAddModal(true)
  }

  // ส่งข้อมูลหนังสือ (เพิ่มหรือแก้ไข) ไปยัง Backend
  const handleSaveBook = async (e) => {
    e.preventDefault()
    try {
      const headers = { headers: { Authorization: `Bearer ${token}` } }
      if (isEditing) {
        await axios.put(`http://localhost:3000/admin/book/${currentBookId}`, newBook, headers)
        Swal.fire({ icon: 'success', title: 'แก้ไขเรียบร้อย!', showConfirmButton: false, timer: 1500, background: '#1a1a2e', color: '#fff' })
      } else {
        await axios.post('http://localhost:3000/admin/book', newBook, headers)
        Swal.fire({ icon: 'success', title: 'เพิ่มเรียบร้อย!', showConfirmButton: false, timer: 1500, background: '#1a1a2e', color: '#fff' })
      }
      fetchBooks()
      setShowAddModal(false)
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#1a1a2e', color: '#fff' })
    }
  }

  // ลบหนังสือออกจากระบบ (เฉพาะ Admin)
  const handleDeleteBook = async (id) => {
    Swal.fire({
      title: 'แน่ใจนะว่าจะลบ?',
      text: "ลบแล้วกู้คืนไม่ได้นะ! 🗑️",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก',
      background: '#1a1a2e',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/admin/book/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          Swal.fire({ title: 'ลบเรียบร้อย!', icon: 'success', background: '#1a1a2e', color: '#fff', confirmButtonColor: '#667eea' })
          fetchBooks()
        } catch (error) {
          Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#1a1a2e', color: '#fff' })
        }
      }
    })
  }

  // ดึงข้อมูลสินค้าในตะกร้าของผู้ใช้งาน
  const fetchCart = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCartItems(response.data)
    } catch (error) {
      console.error("Error fetching cart:", error)
    }
  }

  // เพิ่มหนังสือลงในตะกร้า
  const handleAddToCart = async (bookId) => {
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'ต้อง Login ก่อนถึงจะช้อปได้นะ!',
        background: '#1a1a2e',
        color: '#fff'
      })
      return
    }

    try {
      await axios.post('http://localhost:3000/api/cart',
        { book_id: bookId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        background: '#4cd964',
        color: '#fff'
      })
      Toast.fire({ icon: 'success', title: 'เพิ่มลงตะกร้าแล้ว!' })

      fetchCart()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'เพิ่มสินค้าไม่สำเร็จ',
        background: '#1a1a2e',
        color: '#fff'
      })
    }
  }

  // ลบสินค้าออกจากตะกร้า
  const handleRemoveFromCart = async (itemId) => {
    try {
      await axios.delete(`http://localhost:3000/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchCart()
    } catch (error) {
      console.error("ลบสินค้าไม่สำเร็จ", error)
    }
  }

  return (
    <div>
      {/* เอฟเฟกต์ภาพพื้นหลังอวกาศ */}
      <div className="space-background"></div>
      <div className="stars"></div>
      <div className="galaxy-glow"></div>
      <div className="shooting-stars">
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
      </div>

      {/* แถบเมนูด้านบน (Navbar) */}
      <nav className="navbar glass-panel">
        <div className="nav-logo">
          <span className="nav-logo-icon">🚀</span> SPACE BOOK STORE
        </div>

        <div className="nav-actions">
          {!token ? (
            <Link to="/login" className="btn-primary">🔐 Login</Link>
          ) : (
            <>
              {role === 'admin' ? (
                <div className="admin-badge"><span>👮</span> Admin Mode</div>
              ) : (
                <>
                  <button className="nav-cart-btn" onClick={() => setShowCart(true)}>
                    🛒
                    {cartItems.length > 0 && (
                      <span className="cart-badge">{cartItems.length}</span>
                    )}
                  </button>

                  <div className="user-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(76, 217, 100, 0.2)', padding: '8px 15px', borderRadius: '20px', border: '1px solid rgba(76, 217, 100, 0.3)', color: '#86efac', fontSize: '0.9rem' }}>
                    <span>🧑‍🚀</span> {name}
                  </div>
                </>
              )}

              {/* เฉพาะ Admin เท่านั้นที่เห็นปุ่มเพิ่มหนังสือ */}
              {role === 'admin' && (
                <button className="add-book-btn" onClick={openAddModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  เพิ่มหนังสือ
                </button>
              )}

              <button className="btn-danger" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>

      {/* หน้าต่างตะกร้าสินค้า */}
      {showCart && (
        <Cart
          cartItems={cartItems}
          onClose={() => setShowCart(false)}
          onRemove={handleRemoveFromCart}
        />
      )}

      {/* หน้าต่างจัดการข้อมูลหนังสือ (เพิ่ม/แก้ไข) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {isEditing ? '📝 แก้ไขข้อมูลหนังสือ' : '📚 เพิ่มหนังสือใหม่'}
              </h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form className="modal-form" onSubmit={handleSaveBook}>
              <input className="glass-input" placeholder="ชื่อหนังสือ..." value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} required />
              <input className="glass-input" placeholder="ชื่อผู้แต่ง..." value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} required />
              <input className="glass-input" type="number" placeholder="ราคา..." value={newBook.price} onChange={e => setNewBook({ ...newBook, price: parseInt(e.target.value) || 0 })} required />
              <input
                className="glass-input"
                type="number"
                placeholder="จำนวนสินค้า (Stock)..."
                value={newBook.stock}
                onChange={e => setNewBook({ ...newBook, stock: parseInt(e.target.value) || 0 })}
                required
              />
              <input className="glass-input" placeholder="ลิงก์รูปภาพ (URL)..." value={newBook.image_url} onChange={e => setNewBook({ ...newBook, image_url: e.target.value })} />
              <button type="submit" className="btn-primary">
                {isEditing ? 'บันทึกการแก้ไข' : '✨ ยืนยันเพิ่มหนังสือ'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* รายการหนังสือหลัก */}
      <div className={`container ${!token ? 'guest-mode-center' : ''}`}>
        <div className="section-title">
          <h2><img src={sectionIcon} alt="icon" className="section-icon" />คลังหนังสือจักรวาล</h2>
          <p>สำรวจหนังสือน่าอ่านจากทั่วทุกมุมกาแล็กซี่</p>
        </div>

        <div className="book-grid">
          {books.map((book) => (
            <BookCard
              key={book.ID}
              book={book}
              isAdmin={token && role === 'admin'}
              onDelete={handleDeleteBook}
              onEdit={handleEditClick}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App