import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const email = formData.email.toLowerCase();

        // --- 核心修正：超嚴格 Email 結尾檢查 ---
        // 只有這兩種結尾會通過，其餘（包含 .co）都會被擋下
        const allowedEndings = [".com", ".tw"];
        const hasValidEnding = allowedEndings.some(ending => email.endsWith(ending));

        if (!hasValidEnding) {
            alert("登入失敗：Email 必須以 .com 或 .tw 結尾！");
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (res.ok) {
                // 1. 儲存 JWT Token
                localStorage.setItem('token', data.token);

                // 2. 儲存完整 user 物件
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // 3. 更新 App.js 的狀態
                setUser(data.user); 

                alert(`歡迎回來, ${data.user.username}!`);
                navigate('/'); 
            } else {
                alert("⚠️ 登入失敗: " + data.message);
            }
        } catch (err) {
            alert("無法連接伺服器，請稍後再試。");
        }
    };

    return (
        <div style={formContainer}>
            <h2 style={{ color: '#92A8D1' }}>💎 會員登入</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                <input 
                    type="email" 
                    placeholder="請輸入註冊的 Email (.com 或 .tw)" 
                    style={inputStyle}
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="密碼" 
                    style={inputStyle}
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    required 
                />
                <button type="submit" style={buttonStyle}>登入系統</button>
            </form>
            <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#888' }}>
                還沒有帳號？ <span onClick={() => navigate('/register')} style={{ cursor: 'pointer', color: '#F7CAC9', fontWeight: 'bold' }}>立即註冊</span>
            </p>
        </div>
    );
}

// 樣式設定保持不變
const formContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '80px' };
const formStyle = { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px', 
    width: '320px',
    padding: '30px',
    border: '1px solid #eee',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
};
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' };
const buttonStyle = { 
    backgroundColor: '#92A8D1', 
    color: 'white', 
    border: 'none', 
    padding: '12px', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem'
};

export default Login;