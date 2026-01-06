import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import './App.css'
import BookCard from './BookCard'
import sectionIcon from './assets/Icon.png'

function App() {
  const [books, setBooks] = useState([])
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [role, setRole] = useState(localStorage.getItem('role') || '')
  const [name, setName] = useState(localStorage.getItem('name') || '')

  // State สำหรับ Book Form
  const [newBook, setNewBook] = useState({ title: '', author: '', price: 0, image_url: '', stock: 0 })

  // State ควบคุมการเปิด/ปิด Modal
  const [showAddModal, setShowAddModal] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [currentBookId, setCurrentBookId] = useState(null)

  useEffect(() => {
      const storedToken = localStorage.getItem('token')
      const storedRole = localStorage.getItem('role')
      if (storedToken) setToken(storedToken)
      if (storedRole) setRole(storedRole)
      fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/books')
      setBooks(response.data)
    } catch (error) {
      console.error("โหลดหนังสือไม่สำเร็จ", error)
    }
  }

  const handleLogout = () => {
    setToken('')
    setRole('')
    setName('')
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    Swal.fire({
      icon: 'info',
      title: 'ออกจากระบบแล้ว',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      background: '#1a1a2e',
      color: '#fff'
    })
  }
  const openAddModal = () => {
    setIsEditing(false)
    setCurrentBookId(null)
    // เพิ่ม stock: 0
    setNewBook({ title: '', author: '', price: 0, image_url: '', stock: 0 }) 
    setShowAddModal(true)
  }

  const handleEditClick = (book) => {
    setIsEditing(true)
    setCurrentBookId(book.ID)
    setNewBook({
      title: book.title,
      author: book.author,
      price: book.price,
      image_url: book.image_url || '',
      stock: book.stock || 0 // <--- ดึงค่า stock มาใส่
    })
    setShowAddModal(true)
  }
  
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

  return (
    <div>
      {/* Background Effects */}
      <div className="space-background"></div>
      <div className="stars"></div>
      <div className="galaxy-glow"></div>
      <div className="shooting-stars">
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
      </div>

      {/* Navbar */}
      <nav className="navbar glass-panel">
        <div className="nav-logo">
          <span className="nav-logo-icon">🚀</span>
          SPACE BOOK STORE
        </div>

        <div className="nav-actions">
          {!token ? (
            // Link ไปยังหน้า Login
            <Link to="/login" className="btn-primary">
              🔐 Login
            </Link>
          ) : (
            <>
              {/* --- จุดที่แก้ไข: เช็ค Role เพื่อแสดงป้ายต่างกัน --- */}
              {role === 'admin' ? (
                // กรณีเป็น Admin ให้โชว์แบบเดิม
                <div className="admin-badge">
                  <span>👮</span> Admin Mode
                </div>
              ) : (
                // กรณีเป็น User ให้โชว์ชื่อ
                <div className="user-badge" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(76, 217, 100, 0.2)', // สีเขียวอ่อนๆ
                    padding: '8px 15px',
                    borderRadius: '20px',
                    border: '1px solid rgba(76, 217, 100, 0.3)',
                    color: '#86efac',
                    fontSize: '0.9rem'
                }}>
                  <span>🧑‍🚀</span> {name} {/* แสดงชื่อ User ตรงนี้ */}
                </div>
              )}
              {/* ปุ่มเพิ่มหนังสือ ควรโชว์เฉพาะ Admin เท่านั้น */}
              {role === 'admin' && (
                <button className="add-book-btn" onClick={openAddModal}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                เพิ่มหนังสือ
              </button>)}
              <button className="btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>


      {/* Add/Edit Book Modal (เหมือนเดิม) */}
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
              {/* 🔥 เพิ่มช่อง Stock ตรงนี้ */}
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

      {/* Main Content */}
      <div className={`container ${!token ? 'guest-mode-center' : ''}`}>
        <div className="section-title">
          <h2>
            <img
              src={sectionIcon}
              alt="icon"
              className="section-icon"
            />
            คลังหนังสือจักรวาล
          </h2>
          <p>สำรวจหนังสือน่าอ่านจากทั่วทุกมุมกาแล็กซี่</p>
        </div>

        <div className="book-grid">
          {books.map((book) => (
            <BookCard
              key={book.ID}
              book={book}
              // 🔴 แก้ไขตรงนี้: เปลี่ยนเงื่อนไข isAdmin
              isAdmin={token && role === 'admin'} 
              
              onDelete={handleDeleteBook}
              onEdit={handleEditClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App