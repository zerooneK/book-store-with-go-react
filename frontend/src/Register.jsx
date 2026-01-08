// Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import './Login.css' // ใช้ CSS เดียวกับหน้า Login ได้เลย ธีมเดียวกัน

// 1. กำหนดค่าคงที่สำหรับ API Base URL
const API_BASE_URL = 'http://localhost:3000'

function Register() {
    const navigate = useNavigate()

    // State สำหรับเก็บข้อมูลฟอร์ม
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [isLoading, setIsLoading] = useState(false)

    // ฟังก์ชันจัดการการพิมพ์ใน Input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        })
    }

    const handleRegister = async (e) => {
        e.preventDefault()

        // --- 2. การตรวจสอบความถูกต้องขั้นสูง (Advanced Validation) ---

        // ตรวจสอบความสอดคล้องของรหัสผ่าน
        if (formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'รหัสผ่านไม่ตรงกัน',
                text: 'กรุณากรอกรหัสผ่านยืนยันให้ตรงกับรหัสผ่านที่ตั้งไว้',
                background: '#1a1a2e',
                color: '#fff'
            })
            return
        }

        // ตรวจสอบความแข็งแรงของรหัสผ่าน (Regex: ต้องมีทั้งตัวอักษรและตัวเลข)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
        if (!passwordRegex.test(formData.password)) {
            Swal.fire({
                icon: 'warning',
                title: 'รหัสผ่านไม่ปลอดภัยพอ',
                text: 'รหัสผ่านต้องมีตัวอักษรและตัวเลขผสมกันอย่างน้อยอย่างละ 1 ตัว',
                background: '#1a1a2e',
                color: '#fff',
                confirmButtonColor: '#ffb300'
            })
            return
        }

        // ตรวจสอบความยาวขั้นต่ำ
        if (formData.password.length < 8) {
            Swal.fire({
                icon: 'warning',
                title: 'รหัสผ่านสั้นเกินไป',
                text: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
                background: '#1a1a2e',
                color: '#fff'
            })
            return
        }

        setIsLoading(true)

        try {
            // --- 3. การเตรียมข้อมูล (Data Cleaning) ---
            const cleanName = formData.name.trim()
            const cleanEmail = formData.email.trim()

            // 2. ยิง API ไปที่ Backend
            await axios.post(`${API_BASE_URL}/signup`, {
                name: cleanName,
                email: cleanEmail,
                password: formData.password
            })

            // 3. ถ้าสำเร็จ
            Swal.fire({
                icon: 'success',
                title: 'สมัครสมาชิกสำเร็จ!',
                text: 'ยินดีต้อนรับสู่ยานแม่! กรุณาเข้าสู่ระบบเพื่อเริ่มต้นการเดินทาง',
                background: '#1a1a2e',
                color: '#fff',
                confirmButtonColor: '#667eea',
                timer: 3000
            }).then(() => {
                navigate('/login') // เด้งไปหน้า Login
            })

        } catch (error) {
            // 4. ถ้ามี Error (เช่น อีเมลซ้ำ หรือเซิร์ฟเวอร์มีปัญหา)
            let errorMessage = error.response?.data?.error || 'เกิดข้อผิดพลาดบางอย่างในการสมัครสมาชิก'
            if (!error.response) {
                errorMessage = 'ไม่สามารถเชื่อมต่อเครื่องแม่ข่ายได้ กรุณาลองใหม่ภายหลัง'
            }

            Swal.fire({
                icon: 'error',
                title: 'สมัครสมาชิกไม่สำเร็จ',
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
            {/* รักษาเอฟเฟกต์ภาพพื้นหลังอวกาศไว้ตามเดิม */}
            <div className="login-space-background"></div>
            <div className="login-stars"></div>
            <div className="login-nebula login-nebula-1"></div>
            <div className="login-nebula login-nebula-3"></div>

            <nav className="login-navbar">
                <Link to="/" className="login-navbar-logo">
                    <span>🚀</span> SPACE BOOK STORE
                </Link>
            </nav>

            <div className="login-container">
                <div className="login-glass-card">
                    <div className="login-page-header">
                        <div className="login-page-icon">👽</div>
                        <h1 className="login-page-title">Join the Crew</h1>
                        <p className="login-page-subtitle">สมัครสมาชิกเพื่อเริ่มต้นการเดินทางสู่จักรวาลแห่งความรู้</p>
                    </div>

                    <form className="login-page-form" onSubmit={handleRegister}>
                        <div className="login-page-input-group">
                            <label htmlFor="name">Display Name</label>
                            <input
                                id="name"
                                type="text"
                                className="login-page-input"
                                placeholder="Captain Jack"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                minLength={4}
                            />
                        </div>

                        <div className="login-page-input-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className="login-page-input"
                                placeholder="explorer@space.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="login-page-input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="login-page-input"
                                placeholder="•••••••• (ตัวอักษรและตัวเลขอย่างน้อย 8 ตัว)"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                            />
                        </div>

                        <div className="login-page-input-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="login-page-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-login-page-submit"
                            disabled={isLoading}
                        >
                            {isLoading ? '⏳ กำลังสมัครสมาชิก...' : '✨ Sign Up Now'}
                        </button>
                    </form>

                    <div className="login-divider">or</div>

                    <div className="login-back-link">
                        <Link to="/login">
                            มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register