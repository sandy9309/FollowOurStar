import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user'); 
  const [currentUserId, setCurrentUserId] = useState(null); // 新增：存儲當前用戶 ID
  const navigate = useNavigate();

  const fetchOrders = () => {
    const token = localStorage.getItem('token');
    const savedUserString = localStorage.getItem('user');
    
    if (!token || !savedUserString) {
      navigate('/login');
      return;
    }

    const savedUser = JSON.parse(savedUserString);
    setUserRole(savedUser.role);
    setCurrentUserId(savedUser.id || savedUser._id); // 確保抓到 ID

    fetch('http://localhost:5000/api/products/my-orders', {
      headers: { 'Authorization': token }
    })
    .then(res => res.json())
    .then(data => {
      // 確保 data 是陣列
      const orderList = Array.isArray(data) ? data : [];
      setOrders(orderList);
      setLoading(false);
    })
    .catch(err => {
      console.error("抓取失敗", err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- 管理員確認訂單功能 ---
  const handleConfirmOrder = async (orderId) => {
    if (!window.confirm("確定要將此訂單標記為「已確認」嗎？")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/products/order/confirm/${orderId}`, {
        method: 'PUT',
        headers: { 'Authorization': token }
      });
      if (res.ok) {
        alert("訂單已確認！");
        fetchOrders(); 
      }
    } catch (err) {
      alert("連線失敗");
    }
  };

  // --- 刪除/取消邏輯 ---
  const handleDelete = async (orderId, orderStatus) => {
    const isAdmin = userRole === 'admin';
    if (!isAdmin && orderStatus === 'confirmed') {
      alert("⚠️ 此訂單已進入處理流程，不可取消。");
      return;
    }
    if (!window.confirm(isAdmin ? "管理員：確定刪除？" : "確定取消？")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/products/order/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      if (res.ok) {
        alert("操作成功");
        fetchOrders(); 
      }
    } catch (err) {
      alert("連線失敗");
    }
  };

  if (loading) return <div style={{padding: '2rem'}}>正在加載...</div>;

  const isAdmin = userRole === 'admin';

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: isAdmin ? '#92A8D1' : '#F7CAC9' }}>
        {isAdmin ? '👮 全體訂單管理 (管理員模式)' : '🛒 我的歷史訂單'}
      </h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: isAdmin ? '#92A8D1' : '#F7CAC9', color: 'white' }}>
            <th style={thStyle}>日期</th>
            {isAdmin && <th style={thStyle}>訂購者 ID</th>}
            <th style={thStyle}>商品名稱</th>
            <th style={thStyle}>金額</th>
            <th style={thStyle}>狀態</th>
            <th style={thStyle}>操作</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan={isAdmin ? 6 : 5} style={{padding: '20px', textAlign: 'center'}}>尚無資料</td></tr>
          ) : (
            orders.map(order => {
              const isConfirmed = order.status === 'confirmed';
              return (
                <tr key={order._id} style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}>{new Date(order.orderDate).toLocaleDateString()}</td>
                  {isAdmin && <td style={{...tdStyle, fontSize: '0.75rem', color: '#888'}}>{order.userId}</td>}
                  <td style={tdStyle}>{order.productName}</td>
                  <td style={tdStyle}>NT$ {order.price.toLocaleString()}</td>
                  <td style={tdStyle}>
                    <span style={{ color: isConfirmed ? '#2ecc71' : '#f39c12', fontWeight: 'bold' }}>
                      {isConfirmed ? '已確認' : '處理中'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      {isAdmin && !isConfirmed && (
                        <button onClick={() => handleConfirmOrder(order._id)} style={confirmBtnStyle}>確認</button>
                      )}
                      {(isAdmin || !isConfirmed) ? (
                        <button onClick={() => handleDelete(order._id, order.status)} style={isAdmin ? adminDelBtnStyle : delBtnStyle}>
                          {isAdmin ? '刪除' : '取消'}
                        </button>
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '0.8rem' }}>不可取消</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// 樣式區 (不變)
const thStyle = { padding: '12px' };
const tdStyle = { padding: '12px' };
const delBtnStyle = { backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' };
const adminDelBtnStyle = { ...delBtnStyle, backgroundColor: '#AAAAAA' };
const confirmBtnStyle = { backgroundColor: '#555', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' };

export default Orders;