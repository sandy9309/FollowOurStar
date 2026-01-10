import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({ 
        username: '', 
        email: '',    
        password: '', 
        phone: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const email = formData.email.toLowerCase(); // 轉小寫統一檢查

        // 1. Email 嚴格驗證
        // 第一層：Regex 基本格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // 第二層：限定結尾必須是 .com 或 .tw (排除 .co, .net 等)
        const allowedEndings = [".com", ".tw"];
        const hasValidEnding = allowedEndings.some(ending => email.endsWith(ending));

        if (!emailRegex.test(email) || !hasValidEnding) {
            alert(" Email 格式不正確！僅支援 .com 或 .tw 結尾的信箱");
            return;
        }

        // 2. 手機號碼格式檢查 (必須是 09 開頭且總共 10 位數字)
        const phoneRegex = /^09\d{8}$/;
        if (!phoneRegex.test(formData.phone)) {
            alert(" 手機號碼格式錯誤！請輸入 09 開頭的 10 位數字");
            return;
        }

        // 3. 密碼長度檢查
        if (formData.password.length < 6) {
            alert(" 密碼長度至少需要 6 位數");
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            if (res.ok) {
                alert(" 註冊成功！請使用 Email 登入");
                navigate('/login'); 
            } else {
                alert("⚠️ 註冊失敗: " + data.message);
            }
        } catch (err) {
            alert("無法連接至伺服器，請檢查網路。");
        }
    };

    return (
        <div style={formContainer}>
            <h2 style={{ color: '#F7CAC9' }}>💎 加入 FollowOurStar</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                <input 
                    type="text" 
                    placeholder="顯示名稱 (暱稱)" 
                    style={inputStyle}
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                    required 
                />
                
                <input 
                    type="email" 
                    placeholder="Email (僅限 .com 或 .tw)" 
                    style={inputStyle}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    required 
                />

                <input 
                    type="password" 
                    placeholder="設定密碼 (至少 6 位)" 
                    style={inputStyle}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    required 
                />
                
                <input 
                    type="tel" 
                    placeholder="手機號碼 (09xxxxxxxx)" 
                    style={inputStyle}
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    required 
                />
                
                <button type="submit" style={buttonStyle}>立即註冊</button>
            </form>
            <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#888' }}>
                已有帳號？ <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: '#92A8D1' }}>前往登入</span>
            </p>
        </div>
    );
}

const formContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', width: '320px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const inputStyle = { padding: '12px', borderRadius: '4px', border: '1px solid #ddd', outline: 'none' };
const buttonStyle = { padding: '12px', backgroundColor: '#F7CAC9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default Register;