const Store = require('../model/storeModel');

class StoreController {
    // Tạo cửa hàng mới
    async createStore(req, res) {
        try {
            const { name, phone, location } = req.body; // Bỏ trường currentQuantity
            const store = await Store.create({ name, phone, location });
            res.status(201).json({ success: true, store });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Lấy danh sách cửa hàng
    async getAllStores(req, res) {
        try {
            const stores = await Store.find().populate('orders'); 
            res.status(200).json({ success: true, stores });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Lấy thông tin cửa hàng theo ID
    async getStoreById(req, res) {
        try {
            const store = await Store.findById(req.params.id).populate('orders');
            if (!store) {
                return res.status(404).json({ success: false, message: 'Store not found' });
            }
            res.status(200).json({ success: true, store });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Cập nhật thông tin cửa hàng
    async updateStore(req, res) {
        try {
            const { name, phone, location } = req.body; // Bỏ trường currentQuantity
            const store = await Store.findByIdAndUpdate(
                req.params.id,
                { name, phone, location },
                { new: true }
            );
            if (!store) {
                return res.status(404).json({ success: false, message: 'Store not found' });
            }
            res.status(200).json({ success: true, store });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // Xóa cửa hàng
    async deleteStore(req, res) {
        try {
            const store = await Store.findByIdAndDelete(req.params.id);
            if (!store) {
                return res.status(404).json({ success: false, message: 'Store not found' });
            }
            res.status(200).json({ success: true, message: 'Store deleted' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
}

module.exports = new StoreController();
