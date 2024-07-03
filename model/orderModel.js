const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    totalPrice: { type: Number, required: true, default: 0 },
    quantity: { type: Number, required: true, default: 0 },
    description: { type: String },
    date: { type: Date, default: Date.now },
    orderDetails: [{ type: Schema.Types.ObjectId, ref: 'OrderDetail' }],
    customerID: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
    storeID: { type: Schema.Types.ObjectId, ref: 'Store' },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled', 'not enough'],
        default: 'pending'
    },
    cashPaid: { type: Number, default: 0 },
    bankPaid: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    excessAmount: { type: Number, default: 0 },
    totalProfit: { type: Number, required: true, default: 0 } // Thêm trường totalProfit
});

module.exports = mongoose.model("Order", OrderSchema);
