import React, { useState, useEffect } from 'react';

function Home({ user }) {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '專輯', status: '現貨', stock: 10 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("抓取失敗:", err));
  };

  // --- 處理修改庫存 (Update) ---
  const handleUpdateStock = async (productId, currentStock) => {
    const newStock = prompt("請輸入新的庫存總量 (這會影響剩餘庫存計算)：", currentStock);
    if (newStock === null || newStock === "") return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ stock: parseInt(newStock) })
      });

      if (res.ok) {
        alert(" 庫存更新成功！");
        fetchProducts(); // 重新整理列表看到最新庫存
      } else {
        const data = await res.json();
        alert(" 修改失敗: " + data.message);
      }
    } catch (err) {
      alert(" 無法連接到伺服器");
    }
  };

  // --- 處理立即訂購 (含二次確認) ---
  const handleOrder = async (productId) => {
    if (!user) {
      alert("⚠️ 請先登入帳號後再進行訂購！");
      return;
    }

    // 新增：二次確認對話框
    const confirmOrder = window.confirm(" 確定要訂購這件 SEVENTEEN 周邊商品嗎？");
    if (!confirmOrder) return; // 使用者按取消則中斷

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/products/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchProducts(); // 訂購後更新剩餘庫存顯示
      } else {
        alert(" 訂購失敗: " + data.message);
      }
    } catch (err) {
      alert(" 無法連接到伺服器");
    }
  };

  // --- 處理新增商品 ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': token 
      },
      body: JSON.stringify(newProduct)
    });

    if (res.ok) {
      alert(" 商品上架成功！");
      setShowAddForm(false);
      fetchProducts();
    } else {
      const errorData = await res.json();
      alert(" 錯誤: " + errorData.message);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>💎 SEVENTEEN 周邊代購清單</h2>
        {isAdmin && (
          <button onClick={() => setShowAddForm(!showAddForm)} style={adminBtnStyle}>
            {showAddForm ? '取消新增' : '➕ 新增代購周邊'}
          </button>
        )}
      </header>

      {showAddForm && (
        <form onSubmit={handleAddProduct} style={addFormStyle}>
          <input type="text" placeholder="商品名稱" onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
          <input type="number" placeholder="價格" onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
          <input type="number" placeholder="初始庫存量" onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
          <select onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
            <option value="專輯">專輯</option>
            <option value="小卡">官方應援物</option>
            <option value="官方周邊">官方周邊</option>
            <option value="應援物">非官方應援物</option>
            <option value="小卡">小卡</option>
            <option value="演唱會紀錄片">演唱會紀錄片</option>
          </select>
          <button type="submit" style={submitBtnStyle}>確認上架</button>
        </form>
      )}

      <div style={gridStyle}>
        {products.map(p => {
          const isOutOfStock = p.remainingStock <= 0;
          return (
            <div key={p._id} style={cardStyle}>
              <h3>{p.name}</h3>
              <p style={{ color: '#555', fontWeight: 'bold' }}>價格: ${p.price}</p>
              <p>分類: {p.category}</p>
              
              {isAdmin && (
                <div style={adminInfoStyle}>
                  <p> 已售出: {p.totalSold || 0} 件</p>
                  <p style={{ color: (p.remainingStock || 0) < 5 ? 'red' : 'green' }}>
                     剩餘庫存: {p.remainingStock}
                  </p>
                  <button 
                    onClick={() => handleUpdateStock(p._id, p.stock)}
                    style={editBtnStyle}
                  >
                     修改總量
                  </button>
                </div>
              )}

              <button 
                onClick={() => handleOrder(p._id)} 
                disabled={isOutOfStock}
                style={{
                  ...orderBtnStyle, 
                  backgroundColor: isOutOfStock ? '#ccc' : '#F7CAC9',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                }}
              >
                {isOutOfStock ? '已售完' : '立即訂購'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 樣式設定
const adminBtnStyle = { backgroundColor: '#92A8D1', color: 'white', padding: '10px', borderRadius: '5px', cursor: 'pointer', border: 'none' };
const submitBtnStyle = { backgroundColor: '#92A8D1', color: 'white', padding: '5px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer' };
const orderBtnStyle = { color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', fontWeight: 'bold', width: '100%' };
const addFormStyle = { background: '#f9f9f9', padding: '20px', marginBottom: '20px', borderRadius: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap', border: '1px dashed #92A8D1' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '20px' };
const cardStyle = { border: '1px solid #ddd', padding: '15px', borderRadius: '12px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const adminInfoStyle = { backgroundColor: '#f0f4f8', padding: '10px', borderRadius: '8px', margin: '10px 0', fontSize: '0.9rem', textAlign: 'left' };
const editBtnStyle = { marginTop: '5px', fontSize: '0.75rem', padding: '3px 8px', cursor: 'pointer', border: '1px solid #92A8D1', borderRadius: '4px', background: 'white', color: '#92A8D1' };

export default Home;