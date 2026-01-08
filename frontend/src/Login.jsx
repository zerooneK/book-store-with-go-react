import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import './Login.css'

// ที่อยู่หลักของ API
const API_BASE_URL = 'http://localhost:3000'

function Login({ onLoginSuccess }) {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                email: email,
                password: password
            })

            // 2. Destructure ข้อมูลจาก response.data ให้สะอาดตา
            const { token, role, name } = response.data

            // บันทึกข้อมูลลง LocalStorage ตามสถาปัตยกรรมเดิม
            localStorage.setItem('token', token)
            localStorage.setItem('role', role)
            localStorage.setItem('name', name)

            // แจ้งสถานะกลับไปยัง Component หลักถ้ามีการระบุมา
            if (onLoginSuccess) {
                onLoginSuccess(token, role)
            }

            Swal.fire({
                icon: 'success',
                title: 'เข้าสู่ระบบสำเร็จ!',
                text: 'ยินดีต้อนรับสู่ Space Book Store 🚀',
                background: '#1a1a2e',
                color: '#fff',
                confirmButtonColor: '#667eea',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                navigate('/')
            })
        } catch (error) {
            // 4. การจัดการ Error แบบละเอียด (แยกแยะระหว่าง Network Error และ Credential Error)
            console.error("Login Error:", error)

            let errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
            if (!error.response) {
                errorMessage = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่ภายหลัง'
            }

            Swal.fire({
                icon: 'error',
                title: 'เข้าสู่ระบบไม่สำเร็จ',
                text: errorMessage,
                background: '#1a1a2e',
                color: '#fff',
                confirmButtonColor: '#ff416c'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-page">
            {/* รักษาเอฟเฟกต์ภาพพื้นหลังอวกาศไว้ทั้งหมด */}
            <div className="login-space-background"></div>
            <div className="login-stars"></div>

            {/* เอฟเฟกต์เนบิวลา */}
            <div className="login-nebula login-nebula-1"></div>
            <div className="login-nebula login-nebula-2"></div>
            <div className="login-nebula login-nebula-3"></div>

            {/* ดาวตกประดับพื้นหลัง */}
            <div className="login-shooting-stars">
                <div className="login-shooting-star"></div>
                <div className="login-shooting-star"></div>
                <div className="login-shooting-star"></div>
            </div>

            {/* แถบนำทางด้านบน */}
            <nav className="login-navbar">
                <Link to="/" className="login-navbar-logo">
                    <span>🚀</span>
                    SPACE BOOK STORE
                </Link>
            </nav>

            {/* กล่องบรรจุฟอร์มเข้าสู่ระบบ */}
            <div className="login-container">
                <div className="login-glass-card">
                    {/* หัวข้อหน้าล็อกอิน */}
                    <div className="login-page-header">
                        <div className="login-page-icon">👨‍🚀</div>
                        <h1 className="login-page-title">Welcome Back</h1>
                        <p className="login-page-subtitle">เข้าสู่ระบบเพื่อจัดการคลังหนังสือ</p>
                    </div>

                    {/* ฟอร์มเข้าสู่ระบบ */}
                    <form className="login-page-form" onSubmit={handleLogin}>
                        <div className="login-page-input-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className="login-page-input"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus  /* รักษาโฟกัสไว้ที่ช่อง Email เมื่อเริ่มหน้า */
                            />
                        </div>

                        <div className="login-page-input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="login-page-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-login-page-submit"
                            disabled={isLoading}
                        >
                            {isLoading ? '⏳ กำลังเข้าสู่ระบบ...' : '🚀 Blast Off (Login)'}
                        </button>
                    </form>

                    {/* เส้นแบ่งทางเลือก */}
                    <div className="login-divider">or</div>

                    {/* ลิงก์ไปยังหน้าอื่นๆ */}
                    <div className="login-back-link" style={{ flexDirection: 'column', gap: '10px' }}>
                        <Link to="/register" style={{ color: '#a5b4fc', borderColor: '#a5b4fc' }}>
                            ยังไม่มีบัญชี? สมัครสมาชิกใหม่
                        </Link>

                        <Link to="/">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            กลับไปยังหน้าแรก
                        </Link>
                    </div>

                    {/* ท้ายแผ่น (Footer) */}
                    <div className="login-footer">
                        Powered by <span>Space Book Store</span> 🌌
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
