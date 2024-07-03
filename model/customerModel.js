const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true  },
    phone: { type: String , required: true },
    address: { type: String, required: true  },
    status: { type: String, default: 'inactive' },
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
});

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
