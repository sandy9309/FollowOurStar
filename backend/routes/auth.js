const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// [註冊邏輯]
router.post('/register', async (req, res) => {
    try {
        // 1. 接收所有必要欄位
        const { username, email, password, phone } = req.body;

        // 2. 檢查 Email 是否已被註冊
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: "此 Email 已被註冊" });
        }

        // 3. 加密密碼
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. 存入資料庫 (包含 email 與 phone)
        const newUser = new User({ 
            username, 
            email,
            password: hashedPassword, 
            phone 
        });

        await newUser.save();
        res.status(201).json({ message: "註冊成功！請登入" });
    } catch (err) {
        console.error("註冊錯誤:", err);
        res.status(500).json({ message: "暱稱重複" });
    }
});

// [登入邏輯]
router.post('/login', async (req, res) => {
    try {
        // 5. 改為接收 email
        const { email, password } = req.body;
        
        // 6. 透過 email 尋找使用者
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "帳號不存在" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "密碼錯誤" });

        // 7. 發放 JWT
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // 8. 回傳完整 user 資訊給前端 localStorage 儲存
        res.json({ 
            token, 
            user: {
                id: user._id,
                username: user.username, 
                email: user.email,
                role: user.role,
                phone: user.phone 
            }
        });
    } catch (err) {
        res.status(500).json({ message: "登入程序出錯" });
    }
});

module.exports = router;