const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order'); 
const auth = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
    try {
        const products = await Product.find().lean();
        const productsWithStats = await Promise.all(products.map(async (product) => {
            const soldCount = await Order.countDocuments({ productId: product._id });
            return {
                ...product,
                totalSold: soldCount,
                remainingStock: (product.stock || 0) - soldCount 
            };
        }));
        res.json(productsWithStats);
    } catch (err) {
        res.status(500).json({ message: "抓取商品失敗" });
    }
});

router.post('/order', auth, async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "找不到該商品" });
        }

        const soldCount = await Order.countDocuments({ productId: product._id });
        if ((product.stock || 0) - soldCount <= 0) {
            return res.status(400).json({ message: "⚠️ 該商品已售罄，無法訂購！" });
        }

        const newOrder = new Order({
            userId: req.user.id,        
            productId: product._id,
            productName: product.name,  
            price: product.price,
            status: 'pending' 
        });

        await newOrder.save();
        res.json({ message: "訂購成功！已加入您的歷史清單。" });
    } catch (err) {
        res.status(500).json({ message: "訂購程序出錯" });
    }
});

router.get('/my-orders', auth, async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'admin') {
            orders = await Order.find()
                .populate('userId', 'username phone') 
                .sort({ orderDate: -1 });
        } else {
            orders = await Order.find({ userId: req.user.id })
                .sort({ orderDate: -1 });
        }
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "無法取得訂單清單" });
    }
});

router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "權限不足" });
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: '商品上架成功！', newProduct });
    } catch (err) {
        res.status(400).json({ message: "上架失敗" });
    }
});

router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "權限不足" });
    try {
        const { stock } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            { $set: { stock: parseInt(stock) } }, 
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: "找不到該商品" });
        res.json({ message: '庫存總量已成功更新！', updatedProduct });
    } catch (err) {
        res.status(400).json({ message: "更新失敗" });
    }
});

router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "權限不足" });
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: '商品已成功移除' });
    } catch (err) {
        res.status(400).json({ message: "刪除失敗" });
    }
});

router.put('/order/confirm/:orderId', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "權限不足" });
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.orderId,
            { $set: { status: 'confirmed' } },
            { new: true }
        );
        if (!updatedOrder) return res.status(404).json({ message: "找不到該訂單" });
        res.json({ message: "訂單已成功確認！", updatedOrder });
    } catch (err) {
        res.status(500).json({ message: "更新訂單狀態失敗" });
    }
});

// 7. [Delete Order] 取消/刪除訂單
router.delete('/order/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: "找不到該訂單" });

        // 安全檢查
        if (req.user.role !== 'admin' && order.status === 'confirmed') {
            return res.status(403).json({ message: "⚠️ 訂單已處理中，無法取消。" });
        }
        if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "您無權操作此訂單" });
        }

        await Order.findByIdAndDelete(req.params.orderId);
        res.json({ message: "訂單紀錄已移除" });
    } catch (err) {
        res.status(500).json({ message: "操作失敗" });
    }
});

module.exports = router;