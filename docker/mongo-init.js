db = db.getSiblingDB('follow_our_star');

// 1. 建立初始商品 (維持原樣)
db.createCollection('products');
db.products.insertMany([
  {
    name: "SVT 官方應援燈 Ver.3",
    category: "應援物",
    price: 1350,
    stock: 17,
    status: "現貨",
    createdAt: new Date()
  },
  {
    name: "SEVENTEEN '17 IS RIGHT HERE' 專輯",
    category: "專輯",
    price: 650,
    stock: 100,
    status: "預購",
    createdAt: new Date()
  }
]);

// 2. 建立預設管理員與使用者 (同步前端驗證規則)
db.createCollection('users');
db.users.insertMany([
  {
    username: "admin_carat",
    password: "svt20150526", 
    role: "admin",
    email: "admin@svt.com",  
    phone: "0900000000"      
  },
  {
    username: "carat_01",
    password: "password123",
    role: "user",
    email: "user@svt.com",   
    phone: "0912345678"      
  }
]);

// 建立索引 (選擇性：確保 Email 不會重複註冊)
db.users.createIndex({ "email": 1 }, { unique: true });

print(" FollowOurStar 資料庫初始化完成！");