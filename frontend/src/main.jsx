import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'

// Component สำหรับหน้า 404: หลงทางในอวกาศ
const NotFound = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    background: '#0d0d1a',
    color: '#fff',
    fontFamily: 'Sarabun, sans-serif'
  }}>
    <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
    <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>หลงทางในอวกาศ 🌌</h2>
    <p style={{ color: '#aaa', marginBottom: '30px' }}>พิกัดที่คุณค้นหา ไม่มีอยู่ในกาแล็กซี่นี้...</p>
    <Link to="/" style={{
      padding: '12px 30px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      textDecoration: 'none',
      borderRadius: '10px',
      fontWeight: 'bold',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    }}>
      🚀 กลับสู่สถานี (หน้าหลัก)
    </Link>
  </div>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* จัดการหน้าที่ไม่มีในระบบ (404 Not Found) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
