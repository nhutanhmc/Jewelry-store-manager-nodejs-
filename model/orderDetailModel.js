const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderDetailSchema = new Schema({
    productID: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    orderID: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    totalPrice: { type: Number, required: true } // Thêm totalPrice vào OrderDetailSchema
});

OrderDetailSchema.pre('save', async function(next) {
    try {
        const product = await mongoose.model('Product').findById(this.productID);
        if (!product) {
            throw new Error("Product not found");
        }
        this.totalPrice = product.price * this.quantity; // Tính toán tổng giá dựa trên giá sản phẩm và số lượng
        next();
    } catch (err) {
        next(err);
    }
});

OrderDetailSchema.post('save', async function(doc) {
    try {
        const order = await mongoose.model('Order').findById(doc.orderID);
        if (!order) {
            throw new Error("Order not found");
        }
        // Tính toán lại quantity từ các orderDetails
        const orderDetails = await mongoose.model('OrderDetail').find({ orderID: doc.orderID });
        order.quantity = orderDetails.reduce((total, detail) => total + detail.quantity, 0);
        await order.save();
    } catch (err) {
        console.error(err);
        throw new Error("Failed to update Order quantity");
    }
});

module.exports = mongoose.model("OrderDetail", OrderDetailSchema);
