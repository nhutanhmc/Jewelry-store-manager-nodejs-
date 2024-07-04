const OrderDetail = require('../model/orderDetailModel');
const Order = require('../model/orderModel');
const Product = require('../model/productModel');

class OrderDetailController {
    // Tạo chi tiết đơn hàng (Thêm sản phẩm vào đơn hàng)
    async createOrderDetail(req, res) {
        try {
            const { products, orderID } = req.body; // products là mảng gồm { productID, quantity }

            // Kiểm tra đơn hàng tồn tại
            const order = await Order.findById(orderID);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            // Kiểm tra trạng thái đơn hàng
            if (order.status !== 'pending') {
                return res.status(400).json({ message: "Order has been processed and cannot be changed" });
            }

            // Xóa tất cả các orderDetails hiện tại của order này
            await OrderDetail.deleteMany({ orderID });

            // Lưu chi tiết đơn hàng mới
            const orderDetails = [];
            let totalPrice = 0;
            let totalProfit = 0;
            let totalQuantity = 0;

            for (const { productID, quantity } of products) {
                // Kiểm tra sản phẩm tồn tại
                const product = await Product.findById(productID);
                if (!product) {
                    return res.status(404).json({ message: `Product with ID ${productID} not found` });
                }

                // Kiểm tra số lượng sản phẩm có đủ không
                if (product.quantity < quantity) {
                    return res.status(400).json({ message: `Product quantity for ${productID} is not enough` });
                }

                // Tạo chi tiết đơn hàng mới
                const itemTotalPrice = product.price * quantity;
                const itemTotalProfit = product.profit * quantity;
                const orderDetail = await OrderDetail.create({ productID, quantity, orderID, totalPrice: itemTotalPrice, totalProfit: itemTotalProfit });

                // Cập nhật tổng giá và tổng lợi nhuận
                totalPrice += itemTotalPrice;
                totalProfit += itemTotalProfit;
                totalQuantity += quantity;

                // Thêm orderDetail vào mảng orderDetails của Order
                order.orderDetails.push(orderDetail._id);
                orderDetails.push(orderDetail);
            }

            // Cập nhật order với tổng giá, tổng lợi nhuận và số lượng
            order.totalPrice = totalPrice;
            order.totalProfit = totalProfit;
            order.quantity = totalQuantity;

            // Lưu order sau khi cập nhật
            await order.save();

            return res.status(201).json({ message: "OrderDetails created or updated", orderDetails });
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
                // Cập nhật lại totalPrice và totalProfit nếu có thay đổi sản phẩm
                orderDetail.totalPrice = product.price * (quantity || orderDetail.quantity);
                orderDetail.totalProfit = product.profit * (quantity || orderDetail.quantity);
            }
            if (quantity) {
                orderDetail.quantity = quantity;
                // Cập nhật lại totalPrice và totalProfit nếu có thay đổi số lượng
                orderDetail.totalPrice = orderDetail.productID.price * quantity;
                orderDetail.totalProfit = orderDetail.productID.profit * quantity;
            }

            await orderDetail.save();

            // Tính toán lại totalPrice và totalProfit của Order
            const order = await Order.findById(orderDetail.orderID).populate('orderDetails');
            order.totalPrice = order.orderDetails.reduce((total, detail) => total + detail.totalPrice, 0);
            order.totalProfit = order.orderDetails.reduce((total, detail) => total + detail.totalProfit, 0);
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

                // Tính toán lại totalProfit của Order
                const orderDetails = await OrderDetail.find({ orderID: order._id });
                order.totalProfit = orderDetails.reduce((total, detail) => total + detail.totalProfit, 0);
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
