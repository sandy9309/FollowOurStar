# API 規格說明文件
## 基礎路徑 (Base URL)```http://localhost:5000/api```
前端 UI 運行於：```http://localhost:3000```
後端 API 運行於：```http://localhost:5000```
## 認證 (Authentication) API

### 1. 使用者註冊 (Register User)

*   **路由**：`/auth/register`
*   **HTTP 方法**：`POST`
*   **請求參數 (Request Body)**：

    | 參數名稱 | 類型   | 必填 | 說明       |
    | :------- | :----- | :--- | :--------- |
    | `username` | `String` | 是   | 使用者名稱 |
    | `email`    | `String` | 是   | 使用者電子郵件，需為唯一 |
    | `password` | `String` | 是   | 使用者密碼，會被加密儲存 |
    | `phone`    | `String` | 是   | 使用者聯絡電話 |

*   **成功回應 (Status: 201 Created)**：

    ```
    {
        "message": "註冊成功！請登入"
    }
    ```

*   **錯誤回應 (Status: 400 Bad Request)**：

    ```
    {
        "message": "此 Email 已被註冊"
    }
    ```

*   **錯誤回應 (Status: 500 Internal Server Error)**：

    ```
    {
        "message": "註冊出錯，請稍後再試"
    }
    ```

### 2. 使用者登入 (Login User)

*   **路由**：`/auth/login`
*   **HTTP 方法**：`POST`
*   **說明**：使用者登入帳號並取得 JWT Token。
*   **請求參數 (Request Body)**：

    | 參數名稱 | 類型   | 必填 | 說明       |
    | :------- | :----- | :--- | :--------- |
    | `email`    | `String` | 是   | 使用者電子郵件 |
    | `password` | `String` | 是   | 使用者密碼 |

*   **成功回應 (Status: 200 OK)**：

    ```
    {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": "65a0e7e2c0e3a7f8b1c2d3e4",
            "username": "testuser",
            "email": "test@example.com",
            "role": "user",
            "phone": "0912345678"
        }
    }
    ```

*   **錯誤回應 (Status: 400 Bad Request)**：

    ```
    {
        "message": "帳號不存在" 
    }
    ```
    或
    ```
    {
        "message": "密碼錯誤"
    }
    ```

*   **錯誤回應 (Status: 500 Internal Server Error)**：

    ```
    {
        "message": "登入程序出錯"
    }
    ```

## 商品與訂單 (Products & Orders) API

### 1. 取得所有商品 (Get All Products)

*   **路由**：`/products`
*   **HTTP 方法**：`GET`
*   **請求參數**：無
*   **成功回應 (Status: 200 OK)**：

    ```
    [
        {
            "_id": "65a0e80ac0e3a7f8b1c2d3e5",
            "name": "SEVENTEEN FML 專輯",
            "price": 850,
            "category": "專輯",
            "status": "現貨",
            "stock": 100,
            "__v": 0,
            "totalSold": 5,
            "remainingStock": 95
        },
        // ... 更多商品
    ]
    ```

*   **錯誤回應 (Status: 500 Internal Server Error)**：

    ```
    {
        "message": "抓取商品失敗"
    }
    ```

### 2. 訂購商品 (Order Product)

*   **路由**：`/products/order`
*   **HTTP 方法**：`POST`
*   **請求參數 (Request Body)**：

    | 參數名稱  | 類型   | 必填 | 說明     |
    | :-------- | :----- | :--- | :------- |
    | `productId` | `String` | 是   | 欲訂購商品的 ID |

*   **請求頭 (Request Headers)**：

    | 參數名稱      | 類型     | 必填 | 說明         |
    | :------------ | :------- | :--- | :----------- |
    | `Authorization` | `String` | 是   | `Bearer <JWT Token>` |

*   **成功回應 (Status: 200 OK)**：

    ```
    {
        "message": "訂購成功！已加入您的歷史清單。"
    }
    ```

*   **錯誤回應 (Status: 400 Bad Request)**：

    ```
    {
        "message": "⚠️ 該商品已售罄，無法訂購！"
    }
    ```

*   **錯誤回應 (Status: 401 Unauthorized)**：

    ```
    {
        "message": "未授權，請先登入"
    }
    ```

*   **錯誤回應 (Status: 404 Not Found)**：

    ```
    {
        "message": "找不到該商品"
    }
    ```

*   **錯誤回應 (Status: 500 Internal Server Error)**：

    ```
    {
        "message": "訂購程序出錯"
    }
    ```

### 3. 取得我的訂單 / 所有訂單 (Get My Orders / All Orders)

*   **路由**：`/products/my-orders`
*   **HTTP 方法**：`GET`
*   **說明**：
    *   一般使用者：取得自己的歷史訂單列表。
    *   管理員：取得所有使用者的訂單列表，並包含訂購者資訊。
*   **請求參數**：無
*   **請求頭 (Request Headers)**：

    | 參數名稱      | 類型     | 必填 | 說明         |
    | :------------ | :------- | :--- | :----------- |
    | `Authorization` | `String` | 是   | `Bearer <JWT Token>` |

*   **成功回應 (Status: 200 OK)**：

    ```
    [
        {
            "_id": "65a0e81fc0e3a7f8b1c2d3e6",
            "userId": {
                "_id": "65a0e7e2c0e3a7f8b1c2d3e4",
                "username": "testuser",
                "phone": "0912345678"
            },
            "productId": "65a0e80ac0e3a7f8b1c2d3e5",
            "productName": "SEVENTEEN FML 專輯",
            "price": 850,
            "status": "pending",
            "orderDate": "2026-01-11T03:00:00.000Z",
            "__v": 0
        },
        // ... 更多訂單
    ]
    ```

*   **錯誤回應 (Status: 401 Unauthorized)**：

    ```
    {
        "message": "未授權，請先登入"
    }
    ```

*   **錯誤回應 (Status: 500 Internal Server Error)**：

    ```
    {
        "message": "無法取得訂單清單"
    }
    ```

### 4. 管理員新增商品 (Admin Add Product)

*   **路由**：`/products`
*   **HTTP 方法**：`POST`
*   **說明**：管理員新增商品。需要 JWT 認證且角色為 `admin`。
*   **請求參數 (Request Body)**：

    | 參數名稱   | 類型     | 必填 | 說明       |
    | :--------- | :------- | :--- | :--------- |
    | `name`     | `String` | 是   | 商品名稱   |
    | `price`    | `Number` | 是   | 商品價格   |
    | `category` | `String` | 是   | 商品類別   |
    | `status`   | `String` | 是   | 商品狀態   |
    | `stock`    | `Number` | 是   | 初始庫存量 |

*   **請求頭 (Request Headers)**：

    | 參數名稱      | 類型     | 必填 | 說明         |
    | :------------ | :------- | :--- | :----------- |
    | `Authorization` | `String` | 是   | `Bearer <JWT Token>` |

*   **成功回應 (Status: 201 Created)**：

    ```
    {
        "message": "商品上架成功！",
        "newProduct": {
            "_id": "65a0e82ac0e3a7f8b1c2d3e7",
            "name": "SEVENTEEN 新專輯",
            "price": 900,
            "category": "專輯",
            "status": "預購",
            "stock": 200,
            "__v": 0
        }
    }
    ```

*   **錯誤回應 (Status: 400 Bad Request)**：

    ```
    {
        "message": "上架失敗"
    }
    ```

*   **錯誤回應 (Status: 401 Unauthorized)**：

    ```
    {
        "message": "未授權，請先登入"
    }
    ```

*   **錯誤回應 (Status: 403 Forbidden)**：

    ```
    {
        "message": "權限不足"
    }
    ```

### 5. 管理員更新商品庫存 (Admin Update Product Stock)

*   **路由**：`/products/:id`
*   **HTTP 方法**：`PUT`
*   **請求參數 (URL Parameters)**：

    | 參數名稱 | 類型     | 必填 | 說明       |
    | :------- | :------- | :--- | :--------- |
    | `id`     | `String` | 是   | 商品的 ID |

*   **請求參數 (Request Body)**：

    | 參數名稱 | 類型     | 必填 | 說明       |
    | :------- | :------- | :--- | :--------- |
    | `stock`  | `Number` | 是   | 新的庫存總量 |

*   **請求頭 (Request Headers)**：

    | 參數名稱      | 類型     | 必填 | 說明         |
    | :------------ | :------- | :--- | :----------- |
    | `Authorization` | `String` | 是   | `Bearer <JWT Token>` |

*   **成功回應 (Status: 200 OK)**：

    ```
    {
        "message": "庫存總量已成功更新！",
        "updatedProduct": {
            "_id": "65a0e82ac0e3a7f8b1c2d3e7",
            "name": "SEVENTEEN 新專輯",
            "price": 900,
            "category": "專輯",
            "status": "預購",
            "stock": 250, // 更新後的庫存
            "__v": 0
        }
    }
    ```

*   **錯誤回應 (Status: 400 Bad Request)**：

    ```
    {
        "message": "更新失敗"
    }
    ```

*   **錯誤回應 (Status: 401 Unauthorized)**：

    ```
    {
        "message": "未授權，請先登入"
    }
    ```

*   **錯誤回應 (Status: 403 Forbidden)**：

    ```
    {
        "message": "權限不足"
    }
    ```

*   **錯誤回應 (Status: 404 Not Found)**：

    ```
    {
        "message": "找不到該商品"
    }
    ```

### 6. 管理員刪除商品 (Admin Delete Product)

*   **路由**：`/products/:id`
*   **HTTP 方法**：`DELETE`
*   **請求參數 (URL Parameters)**：

    | 參數名稱 | 類型     | 必填 | 說明       |
    | :------- | :------- | :--- | :--------- |
    | `id`     | `String` | 是   | 商品的 ID |

*   **請求頭 (Request Headers)**：

    | 參數名稱      | 類型     | 必填 | 說明         |
    | :------------ | :------- | :--- | :----------- |
    | `Authorization` | `String` | 是   | `Bearer <JWT Token>` |

*   **成功回應 (Status: 200 OK)**：

    ```
    {
        "message": "商品已成功移除"
    }
    ```

*   **錯誤回應 (Status: 400 Bad Request)**：

    ```
    {
        "message": "刪除失敗"
    }
    ```

*   **錯誤回應 (Status: 401 Unauthorized)**：

    ```
    {
        "message": "未授權，請先登入"
    }
    ```

*   **錯誤回應 (Status: 403 Forbidden)**：

    ```
    {
        "message": "權限不足"
    }
    ```

### 7. 管理員確認訂單 (Admin Confirm Order)

*   **路由**：`/products/order/confirm/:orderId`
*   **HTTP 方法**：`PUT`
*   **請求參數 (URL Parameters)**：

    | 參數名稱  | 類型     | 必填 | 說明     |
    | :-------- | :------- | :--- | :------- |
    | `orderId` | `String` | 是   | 訂單的 ID |

*   **請求參數 (Request Body)**：無
*   **請求頭 (Request Headers)**：

    | 參數名稱      | 類型     | 必填 | 說明         |
    | :------------ | :------- | :--- | :----------- |
    | `Authorization` | `String` | 是   | `Bearer <JWT Token>` |

*   **成功回應 (Status: 200 OK)**：

    ```
    {
        "message": "訂單已成功確認！",
        "updatedOrder": {
            "_id": "65a0e81fc0e3a7f8b1c2d3e6",
            "userId": "65a0e7e2c0e3a7f8b1c2d3e4",
            "productId": "65a0e80ac0e3a7f8b1c2d3e5",
            "productName": "SEVENTEEN FML 專輯",
            "price": 850,
            "status": "confirmed", // 更新後的狀態
            "orderDate": "2026-01-11T03:00:00.000Z",
            "__v": 0
        }
    }
    ```

*   **錯誤回應 (Status: 401 Unauthorized)**：

    ```
    {
        "message": "未授權，請先登入"
    }
    ```

*   **錯誤回應 (Status: 403 Forbidden)**：

    ```
    {
        "message": "權限不足"
    }
    ```

*   **錯誤回應 (Status: 404 Not Found)**：

    ```
    {
        "message": "找不到該訂單"
    }
    ```

*   **錯誤回應 (Status: 500 Internal Server Error)**：

    ```
    {
        "message": "更新訂單狀態失敗"
    }
    ```

### 8. 取消/刪除訂單 (Cancel/Delete Order)

*   **路由**：`/products/order/:orderId`
*   **HTTP 方法**：`DELETE`
*   **說明**：
    *   一般使用者：取消自己的「處理中」訂單。
    *   管理員：刪除任何訂單（包含已確認的訂單）。
*   **請求參數 (URL Parameters)**：

    | 參數名稱  | 類型     | 必填 | 說明     |
    | :-------- | :------- | :--- | :------- |
    | `orderId` | `String` | 是   | 訂單的 ID |

*   **請求頭 (Request Headers)**：

    | 參數名稱      | 類型     | 必填 | 說明         |
    | :------------ | :------- | :--- | :----------- |
    | `Authorization` | `String` | 是   | `Bearer <JWT Token>` |

*   **成功回應 (Status: 200 OK)**：

    ```
    {
        "message": "訂單紀錄已移除"
    }
    ```

*   **錯誤回應 (Status: 401 Unauthorized)**：

    ```
    {
        "message": "未授權，請先登入"
    }
    ```

*   **錯誤回應 (Status: 403 Forbidden)**：

    ```
    {
        "message": "⚠️ 訂單已處理中，無法取消。" 
    }
    ```
    或
    ```
    {
        "message": "您無權操作此訂單"
    }
    ```

*   **錯誤回應 (Status: 404 Not Found)**：

    ```
    {
        "message": "找不到該訂單"
    }
    ```

*   **錯誤回應 (Status: 500 Internal Server Error)**：

    ```
    {
        "message": "操作失敗"
    }
    ```
