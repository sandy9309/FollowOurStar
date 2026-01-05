const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: String, 
    price: Number,
    status: { 
        type: String, 
        default: 'pending', // 預設值為處理中
        enum: ['pending', 'confirmed'] // 限定只能是這兩種狀態
    },
    orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);