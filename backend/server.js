require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. 引入路由模組
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();

// 2. 中介軟體 (Middleware)
app.use(cors()); // 允許前端跨網域存取
app.use(express.json()); // 允許解析 JSON 格式的 Request Body

// 3. 資料庫連線
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(' 成功連接到 SEVENTEEN 資料庫 (MongoDB)'))
    .catch(err => console.error(' 資料庫連線失敗:', err));

// 4. 設定 API 路由入口
app.use('/api/auth', authRoutes);         // 處理註冊與登入
app.use('/api/products', productRoutes);   // 處理商品與訂購

// 測試用入口：確認後端有在動
app.get('/', (req, res) => {
    res.send(' FollowOurStar API 運作中...');
});

// 5. 啟動伺服器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    -------------------------------------------
     後端啟動成功！
     伺服器網址: http://localhost:${PORT}
     專注於 SEVENTEEN 代購小站
    -------------------------------------------
    `);
});