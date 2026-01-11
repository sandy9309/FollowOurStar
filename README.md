# FollowOurStar - 代購管理平台
## 專案主題與目標
FollowOurStar 是一個專為 SEVENTEEN 代購設計的全端網頁應用程式。此專案旨在提供一個平台，讓使用者可以瀏覽商品、進行商品搜尋、註冊/登入帳戶、進行商品訂購，並管理其訂單。此外，專案也包含管理員功能，以方便管理商品庫存和所有訂單。
## 技術選擇原因
採用了MongoDB, Express.js, React, Node.js 並結合 Docker 進行容器化部署。選擇這些技術的原因如下：

1.前端 (React)
- 採用組件化開發，能高效管理登入、註冊、搜尋等多種互動狀態（State），提供單頁應用（SPA）的流暢感。

2.後端 (Node.js & Express.js)
- Node.js 允許前後端都使用 JavaScript 語言，減少了開發者在不同語言間切換的認知負擔，提高開發效率。
- 非阻塞 I/O 適合處理大量的 API 請求，並能快速實作 RESTful API 與前端對接。
3.資料庫 (MongoDB)
- NoSQL 的靈活性適合代購訂單這種欄位可能隨需求變動的資料結構。
- 易於整合：與 Node.js 配合良好，Mongoose ODM 庫提供了簡潔的 API，使得資料庫操作更加直觀和高效。
- 可擴展性：MongoDB 支援水平擴展，能夠應對未來資料量增長的需求。

4.容器化 (Docker & Docker Compose)
- 環境一致性：Docker 確保開發、測試和生產環境的一致性，避免了「在我的機器上可以跑」的問題。
- 快速部署：Docker 容器包含了應用程式及其所有依賴。
- 服務隔離：Docker Compose 允許定義和運行多容器 Docker 應用程式，將前端、後端和資料庫服務隔離，便於管理和擴展。

 5.安全性 (JWT)
 - 使用 JSON Web Token 實作會員登入驗證，確保管理員介面不被非法存取。
## 架構說明
本專案採用典型的 客戶端-伺服器 (Client-Server) 架構，並透過 Docker Compose 進行服務編排。

#### 組件說明
- 前端應用程式 (React)：
    - 位於 ```frontend/``` 目錄。
    - 呈現使用者介面，處理使用者互動，並透過 API 請求與後端進行資料交換。
    - 主要頁面包括：首頁 (```Home.js```)、登入 (```Login.js```)、註冊 (```Register.js```)、我的訂單 (```Orders.js```)。

   - 功能特色：

        - 商品搜尋：在首頁提供商品名稱的即時搜尋功能。
        - 使用者認證：支援註冊、登入、登出，並透過 localStorage 管理認證狀態。
        - 訂單管理：使用者可查看自己的歷史訂單；管理員可查看所有訂單，並進行確認或刪除操作。
        - 管理員介面：管理員在首頁可新增商品、修改商品庫存；在訂單頁面可管理所有訂單。
    - 使用者認證狀態透過 localStorage 儲存。
- 後端應用程式 (Node.js/Express)：
    - 位於 ```backend/``` 目錄。
    - 處理前端的請求。
        1. API 路由：
        - ```/api/auth```：處理使用者註冊、登入、登出等認證相關功能。
        - ```/api/products```：處理商品資訊的查詢與訂購相關功能。
        - ```/api/products/my-orders```：處理使用者或管理員的訂單查詢。
        - ```/api/products/order/confirm/:id```：管理員確認訂單的 API。
        - ```/api/products/order/:id```：刪除/取消訂單的 API。

        2. 資料模型 (Mongoose)：
        - ```User.js```：使用者模型，包含用戶名、密碼、角色等資訊。
        - ```Product.js```：商品模型，包含商品名稱、價格、描述等資訊。
        - ```Order.js```：訂單模型，記錄使用者訂購的商品及訂單狀態。
    - 中介軟體：```authMiddleware.js ```用於驗證使用者身份和權限。
    - 使用 ```dotenv``` 管理環境變數，例如 ```MONGO_URI``` 和 ```PORT```。
- MongoDB 資料庫：
    - 透過 Docker 容器運行，資料持久化儲存在``` ./docker/mongo-data ```目錄。
    - ```mongo-init.js``` 用於初始化資料庫，設定初始使用者和資料庫。
## 安裝與執行指引
#### 前置條件

在開始之前，請確保您的系統已安裝以下軟體(```Git```、 ```Node.js```、 ```npm```、 ```Docker```、 ```Docker Compose```、 ```Docker```)

#### 步驟一：複製專案
``` 
git clone https://github.com/sandy9309/project-name.git
cd project-name
```
#### 步驟二：設定環境變數

在```backend/```目錄下 ，創建一個 ```.env``` ，並填入以下內容：
```
PORT=5000
MONGO_URI=mongodb://root:password123@localhost:27017/follow_our_star?authSource=admin
JWT_SECRET=your_jwt_secret_key_here # 請替換為一個強大的隨機字串
```
#### 步驟三：啟動 MongoDB 資料庫 (使用 Docker Compose)

進入 ```docker/``` 目錄，然後使用 Docker Compose 啟動 MongoDB 服務：
```
cd docker
docker-compose up -d
```
#### 步驟四：安裝並啟動後端服務
回到專案根目錄，進入 ```backend/``` 目錄，安裝依賴並啟動後端服務：
```
npm install
npm run dev # 或者 npm start
```
#### 步驟五：安裝並啟動前端應用程式
回到專案根目錄，進入 ```frontend/``` 目錄，安裝依賴並啟動前端應用程式：
```
npm install 
npm start
```
前端應用程式將會運行在 http://localhost:3000 (預設 )。

完成以上步驟即可在瀏覽器中打開``` http://localhost:3000 ```來訪問 FollowOurStar 應用程式了！








