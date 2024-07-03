const Order = require('../model/orderModel');
const OrderDetail = require('../model/orderDetailModel');
const Customer = require('../model/customerModel');
const Store = require('../model/storeModel');
const Product = require('../model/productModel');

class OrderController {
    // Tạo đơn hàng
    async createOrder(req, res) {
        try {
            const { customerID, storeID, description, payments, orderDetails = [] } = req.body;

            // Tạo đơn hàng mới
            const order = await Order.create({ customerID, storeID, description, payments });

            // Nếu có chi tiết đơn hàng, thêm vào đơn hàng và cập nhật đơn hàng
            if (orderDetails.length > 0) {
                for (const detail of orderDetails) {
                    const newOrderDetail = await OrderDetail.create({ ...detail, orderID: order._id });
                    order.orderDetails.push(newOrderDetail._id);
                }
                await order.save();
            }

            // Tính toán lại tổng lợi nhuận
            const updatedOrderDetails = await OrderDetail.find({ orderID: order._id });
            order.totalProfit = updatedOrderDetails.reduce((total, detail) => total + detail.totalProfit, 0);
            await order.save();

            // Thêm order vào mảng orders của customer
            await Customer.findByIdAndUpdate(
                customerID,
                { $push: { orders: order._id } }
            );

            // Thêm order vào mảng orders của store
            await Store.findByIdAndUpdate(
                storeID,
                { $push: { orders: order._id } }
            );

            return res.status(201).json({ message: "Order created", order });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    }

    // Lấy danh sách đơn hàng
    async getAllOrders(req, res) {
        try {
            const orders = await Order.find()
                .populate('customerID')
                .populate('storeID')
                .populate('payments')
                .populate({
                    path: 'orderDetails',
                    populate: { path: 'productID' }
                });
            return res.status(200).json({ orders });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    }

    // Lấy chi tiết đơn hàng
    async getOrderById(req, res) {
        try {
            const order = await Order.findById(req.params.orderId)
                .populate('customerID')
                .populate('storeID')
                .populate('payments')
                .populate({
                    path: 'orderDetails',
                    populate: { path: 'productID' }
                });
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }
            return res.status(200).json({ order });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    }

    async updateOrder(req, res) {
        try {
            const { status, description, cashPaid, bankPaid } = req.body;
            const orderId = req.params.orderId;

            const order = await Order.findById(orderId).populate('orderDetails');

            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            // Kiểm tra trạng thái đơn hàng
            if (order.status !== 'pending' && order.status !== 'not enough') {
                return res.status(400).json({ message: "Đơn đã xử lý" });
            }

            // Kiểm tra và cập nhật tiền đã trả
            if (cashPaid || bankPaid) {
                // Nếu status không phải là 'paid', trả về lỗi
                if (status !== 'paid') {
                    return res.status(400).json({ message: "Invalid status for payment update" });
                }

                order.cashPaid += cashPaid || 0;
                order.bankPaid += bankPaid || 0;

                // Tính toán lại số tiền còn lại và dư thừa
                const totalPaid = order.cashPaid + order.bankPaid;
                order.remainingAmount = Math.max(0, order.totalPrice - totalPaid); // Đảm bảo remainingAmount không âm
                order.excessAmount = Math.max(0, totalPaid - order.totalPrice); // Đảm bảo excessAmount không âm
                
                // Cập nhật trạng thái nếu đã thanh toán đủ
                if (order.remainingAmount <= 0) {
                    order.status = 'paid';
                    // Thực hiện các hành động khác khi thanh toán đủ ở đây (ví dụ: gửi email xác nhận, cập nhật số lượng sản phẩm, ...)
                    for (const detail of order.orderDetails) {
                        await Product.findByIdAndUpdate(
                            detail.productID,
                            { $inc: { quantity: -detail.quantity } }
                        );
                    }
                }

                // Nếu status là 'not enough', cập nhật lại status nếu đã thanh toán đủ
                if (order.status === 'not enough' && order.remainingAmount <= 0) {
                    order.status = 'paid';
                }
            } else if (status) {
                // Cập nhật trạng thái khác (nếu có)
                order.status = status;
            }

            if (description) {
                order.description = description;
            }

            await order.save();
            return res.status(200).json({ message: "Order updated", order });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    }

    // Xóa đơn hàng
    async deleteOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            console.log("Deleting order with ID:", orderId);

            // Tìm và xóa đơn hàng
            const order = await Order.findByIdAndDelete(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Xóa tất cả OrderDetail liên quan
            await OrderDetail.deleteMany({ orderID: orderId });

            // Xóa ID đơn hàng trong mảng orders của Customer
            if (order.customerID) {
                await Customer.findByIdAndUpdate(order.customerID, { $pull: { orders: orderId } });
            }

            // Xóa ID đơn hàng trong mảng orders của Store
            if (order.storeID) {
                await Store.findByIdAndUpdate(order.storeID, { $pull: { orders: orderId } });
            }

            return res.status(200).json({ message: 'Order deleted' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    }

    // Tìm kiếm đơn hàng theo tên khách hàng
    async searchOrdersByCustomerName(req, res) {
        try {
            const customerName = req.query.name; // Lấy tên khách hàng từ query string

            // Tìm kiếm khách hàng dựa trên tên (không phân biệt hoa thường)
            const customers = await Customer.find({
                name: { $regex: new RegExp(customerName, 'i') } // Tìm kiếm không phân biệt hoa thường
            });

            // Lấy danh sách ID của các khách hàng tìm được
            const customerIds = customers.map(customer => customer._id);

            // Tìm các đơn hàng có customerID thuộc danh sách customerIds
            const orders = await Order.find({ customerID: { $in: customerIds } })
                .populate('customerID')
                .populate('storeID')
                .populate('payments')
                .populate({
                    path: 'orderDetails',
                    populate: { path: 'productID' }
                });

            return res.status(200).json({ orders });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    }
}

const orderController = new OrderController();
module.exports = {
    createOrder: orderController.createOrder.bind(orderController),
    getAllOrders: orderController.getAllOrders.bind(orderController),
    getOrderById: orderController.getOrderById.bind(orderController),
    updateOrder: orderController.updateOrder.bind(orderController),
    deleteOrder: orderController.deleteOrder.bind(orderController),
    searchOrdersByCustomerName: orderController.searchOrdersByCustomerName.bind(orderController)
};
