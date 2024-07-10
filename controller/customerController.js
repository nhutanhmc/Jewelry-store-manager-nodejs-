const Customer = require('../model/customerModel');

class CustomerController {
    // Tạo khách hàng mới
    async createCustomer(req, res) {
        try {
            const { name, age, phone, address } = req.body;
            
            // Kiểm tra xem số điện thoại đã tồn tại trong DB chưa
            const existingCustomer = await Customer.findOne({ phone });
            if (existingCustomer) {
                return res.status(400).json({ success: false, message: 'Số điện thoại đã được đăng ký', customer: existingCustomer });
            }

            // Nếu số điện thoại chưa tồn tại, tạo mới khách hàng
            const customer = await Customer.create({ name, age, phone, address, status: false });
            res.status(201).json({ success: true, customer });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Lấy danh sách khách hàng
    async getAllCustomers(req, res) {
        try {
            const { phone } = req.query;
            let customers;

            if (phone) {
                customers = await Customer.find({ phone }).populate('orders');
            } else {
                customers = await Customer.find().populate('orders');
            }

            res.status(200).json({ success: true, customers });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Lấy thông tin khách hàng theo ID
    async getCustomerById(req, res) {
        try {
            const customer = await Customer.findById(req.params.id).populate('orders');
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }
            res.status(200).json({ success: true, customer });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
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
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }
            res.status(200).json({ success: true, customer });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Xóa khách hàng
    async deleteCustomer(req, res) {
        try {
            const customer = await Customer.findByIdAndDelete(req.params.id);
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }
            res.status(200).json({ success: true, message: 'Customer deleted' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
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
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }
            res.status(200).json({ success: true, message: 'Customer activated', customer });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Hủy kích hoạt trạng thái khách hàng
    async deactivateCustomer(req, res) {
        try {
            const customer = await Customer.findByIdAndUpdate(
                req.params.id,
                { status: false }, // Sửa thành boolean
                { new: true }
            );
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }
            res.status(200).json({ success: true, message: 'Customer deactivated', customer });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new CustomerController();
