const Customer = require('../model/customerModel');

class CustomerController {
    // Tạo khách hàng mới
    async createCustomer(req, res) {
        try {
            const { name, age, phone, address } = req.body;
            const customer = await Customer.create({ name, age, phone, address, status: false }); // Sửa thành boolean
            res.status(201).json({ success: true, customer });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Lấy danh sách khách hàng
    async getAllCustomers(req, res) {
        try {
            const customers = await Customer.find().populate('orders'); // Populate danh sách đơn hàng
            res.status(200).json(customers);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Lấy thông tin khách hàng theo ID
    async getCustomerById(req, res) {
        try {
            const customer = await Customer.findById(req.params.id).populate('orders');
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            res.status(200).json(customer);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Cập nhật thông tin khách hàng
    async updateCustomer(req, res) {
        try {
            const { name, age, phone, address } = req.body;
            const customer = await Customer.findByIdAndUpdate(
                req.params.id,
                { name, age, phone, address },
                { new: true }
            );
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            res.status(200).json(customer);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Xóa khách hàng
    async deleteCustomer(req, res) {
        try {
            const customer = await Customer.findByIdAndDelete(req.params.id);
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            res.status(200).json({ message: 'Customer deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Kích hoạt trạng thái khách hàng
    async activateCustomer(req, res) {
        try {
            const customer = await Customer.findByIdAndUpdate(
                req.params.id,
                { status: true }, // Sửa thành boolean
                { new: true }
            );
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            res.status(200).json({ success: true, message: 'Customer activated', customer });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new CustomerController();
