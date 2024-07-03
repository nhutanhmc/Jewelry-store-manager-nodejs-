const OrderDetail = require('../model/orderDetailModel');
const Order = require('../model/orderModel');
const Product = require('../model/productModel');

class OrderDetailController {
    // Tạo chi tiết đơn hàng (Thêm sản phẩm vào đơn hàng)
    async createOrderDetail(req, res) {
        try {
            const { productID, quantity, orderID } = req.body;

            // Kiểm tra sản phẩm và đơn hàng tồn tại
            const product = await Product.findById(productID);
            const order = await Order.findById(orderID);
            if (!product || !order) {
                return res.status(404).json({ message: "Product or Order not found" });
            }

            // Kiểm tra số lượng sản phẩm có đủ không
            if (product.quantity < quantity) {
                return res.status(400).json({ message: "Product quantity is not enough" });
            }

            // Tìm OrderDetail đã tồn tại với productID và orderID
            let orderDetail = await OrderDetail.findOne({ productID, orderID });

            if (orderDetail) {
                // Nếu đã tồn tại, chỉ cập nhật số lượng
                orderDetail.quantity = quantity;
                orderDetail.totalPrice = product.price * orderDetail.quantity; // Cập nhật lại totalPrice
            } else {
                // Nếu chưa tồn tại, tạo mới OrderDetail
                const totalPrice = product.price * quantity;
                orderDetail = await OrderDetail.create({ productID, quantity, orderID, totalPrice });
                
                // Thêm orderDetail._id vào mảng orderDetails của Order
                order.orderDetails.push(orderDetail._id); 
                await order.save();
            }

            // Lưu OrderDetail đã cập nhật hoặc tạo mới
            await orderDetail.save();

            return res.status(201).json({ message: "OrderDetail updated or created", orderDetail });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    }
    // Lấy tất cả chi tiết đơn hàng
    async getAllOrderDetails(req, res) {
        try {
            const orderDetails = await OrderDetail.find().populate('productID').populate('orderID');
            return res.status(200).json({ orderDetails });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    }

    // Lấy chi tiết đơn hàng theo ID
    async getOrderDetailById(req, res) {
        try {
            const orderDetail = await OrderDetail.findById(req.params.orderDetailId).populate('productID').populate('orderID');
            if (!orderDetail) {
                return res.status(404).json({ message: "OrderDetail not found" });
            }
            return res.status(200).json({ orderDetail });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    }

    // Cập nhật chi tiết đơn hàng
    async updateOrderDetail(req, res) {
        try {
            const { productID, quantity } = req.body;
            const orderDetailId = req.params.orderDetailId;

            const orderDetail = await OrderDetail.findById(orderDetailId);

            if (!orderDetail) {
                return res.status(404).json({ message: "OrderDetail not found" });
            }

            // Cập nhật thông tin chi tiết đơn hàng
            if (productID) {
                const product = await Product.findById(productID);
                if (!product) {
                    return res.status(404).json({ message: "Product not found" });
                }
                orderDetail.productID = productID;
                // Cập nhật lại totalPrice nếu có thay đổi sản phẩm
                orderDetail.totalPrice = product.price * (quantity || orderDetail.quantity);
            }
            if (quantity) {
                orderDetail.quantity = quantity;
                // Cập nhật lại totalPrice nếu có thay đổi số lượng
                orderDetail.totalPrice = orderDetail.totalPrice || orderDetail.productID.price * quantity;
            }

            await orderDetail.save();

            // Tính toán lại totalPrice của Order
            const order = await Order.findById(orderDetail.orderID).populate('orderDetails');
            order.totalPrice = order.orderDetails.reduce((total, detail) => total + detail.totalPrice, 0);
            await order.save();

            return res.status(200).json({ message: "OrderDetail updated", orderDetail });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    }

    // Xóa chi tiết đơn hàng
    async deleteOrderDetail(req, res) {
        try {
            const orderDetailId = req.params.orderDetailId;

            // Tìm và xóa chi tiết đơn hàng
            const orderDetail = await OrderDetail.findByIdAndDelete(orderDetailId);
            if (!orderDetail) {
                return res.status(404).json({ message: 'OrderDetail not found' });
            }

            // Cập nhật mảng orderDetails trong Order
            const order = await Order.findById(orderDetail.orderID);
            if (order) {
                order.orderDetails.pull(orderDetailId);
                await order.save();
            }

            return res.status(200).json({ message: 'OrderDetail deleted' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    }
}

const orderDetailController = new OrderDetailController();
module.exports = {
    createOrderDetail: orderDetailController.createOrderDetail.bind(orderDetailController),
    getAllOrderDetails: orderDetailController.getAllOrderDetails.bind(orderDetailController),
    getOrderDetailById: orderDetailController.getOrderDetailById.bind(orderDetailController),
    updateOrderDetail: orderDetailController.updateOrderDetail.bind(orderDetailController),
    deleteOrderDetail: orderDetailController.deleteOrderDetail.bind(orderDetailController)
};
