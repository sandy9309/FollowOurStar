import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [searchTerm, setSearchTerm] = useState(""); 
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

    fetch('http://localhost:5000/api/products/my-orders', {
      headers: { 'Authorization': token }
    })
    .then(res => res.json())
    .then(data => {
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

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const productName = order.productName?.toLowerCase() || "";
    const userName = order.userId?.username?.toLowerCase() || ""; 
    return productName.includes(searchLower) || userName.includes(searchLower);
  });

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
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ color: isAdmin ? '#92A8D1' : '#F7CAC9', textAlign: 'center' }}>
        {isAdmin ? '👮 全體訂單管理 (管理員模式)' : '🛒 我的歷史訂單'}
      </h2>

      {/* 搜尋欄位 */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <input 
          type="text" 
          placeholder={isAdmin ? " 搜尋商品或訂購者..." : " 搜尋我的訂單商品..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchBoxStyle}
        />
      </div>
      
      {/* RWD 容器：讓表格在手機版可滑動 */}
      <div style={{ width: '100%', overflowX: 'auto', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ backgroundColor: isAdmin ? '#92A8D1' : '#F7CAC9', color: 'white' }}>
              <th style={thStyle}>日期</th>
              {isAdmin && <th style={thStyle}>訂購者 / 聯絡電話</th>}
              <th style={thStyle}>商品名稱</th>
              <th style={thStyle}>金額</th>
              <th style={thStyle}>狀態</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} style={{padding: '20px', textAlign: 'center'}}>尚無相符資料</td></tr>
            ) : (
              filteredOrders.map(order => {
                const isConfirmed = order.status === 'confirmed';
                return (
                  <tr key={order._id} style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>{new Date(order.orderDate).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td style={tdStyle}>
                        <div style={{fontWeight: 'bold'}}>{order.userId?.username || '訪客'}</div>
                        <div style={{fontSize: '0.8rem', color: '#666'}}> {order.userId?.phone || '未留電話'}</div>
                      </td>
                    )}
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
    </div>
  );
}

const thStyle = { padding: '15px', whiteSpace: 'nowrap' };
const tdStyle = { padding: '12px' };
const delBtnStyle = { backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' };
const adminDelBtnStyle = { ...delBtnStyle, backgroundColor: '#555' };
const confirmBtnStyle = { backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' };
const searchBoxStyle = {
  width: '100%',
  maxWidth: '400px',
  padding: '10px 15px',
  borderRadius: '20px',
  border: '2px solid #ddd',
  outline: 'none',
  fontSize: '1rem'
};

export default Orders;