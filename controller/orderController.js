const Order = require('../model/orderModel');
const OrderDetail = require('../model/orderDetailModel');
const Customer = require('../model/customerModel');
const Store = require('../model/storeModel');
const Product = require('../model/productModel');
const admin = require('../config/firebaseAdmin');

class OrderController {
    // Tạo đơn hàng cho Frontend
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
            await Customer.findByIdAndUpdate(customerID, { $push: { orders: order._id } });

            // Thêm order vào mảng orders của store
            await Store.findByIdAndUpdate(storeID, { $push: { orders: order._id } });

            return res.status(201).json({ success: true, message: "Order created", order });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // Tạo đơn hàng cho Mobile
    async createOrderOnMobile(req, res) {
        try {
            const { customerID, storeID, description, payments, orderDetails = [], deviceToken } = req.body;

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
            await Customer.findByIdAndUpdate(customerID, { $push: { orders: order._id } });

            // Thêm order vào mảng orders của store
            await Store.findByIdAndUpdate(storeID, { $push: { orders: order._id } });

            // Gửi thông báo đến thiết bị di động
            if (deviceToken) {
                await this.sendNotification(deviceToken, 'New Order Created', `Order ${order._id} has been created successfully.`);
            }

            return res.status(201).json({ success: true, message: "Order created", order });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // Hàm gửi thông báo
    async sendNotification(token, title, body) {
        const message = {
            notification: {
                title: title,
                body: body,
            },
            token: token,
        };

        try {
            const response = await admin.messaging().send(message);
            console.log('Notification sent successfully:', response);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }
    // Lấy danh sách đơn hàng
    async getAllOrders(req, res) {
        try {
            const { status, customerName } = req.query; // Lấy status và customerName từ query string

            let query = Order.find();

            // Nếu có status, thêm điều kiện lọc theo status
            if (status) {
                query = query.where('status').equals(status);
            }

            // Nếu có customerName, tìm kiếm khách hàng dựa trên tên
            if (customerName) {
                const customers = await Customer.find({
                    name: { $regex: new RegExp(customerName, 'i') } // Tìm kiếm không phân biệt hoa thường
                });

                const customerIds = customers.map(customer => customer._id);

                // Thêm điều kiện lọc theo customerID
                query = query.where('customerID').in(customerIds);
            }

            const orders = await query
                .sort({ date: -1 }) // Sắp xếp các đơn hàng mới tạo gần nhất trước
                .populate({ path: 'customerID', select: '-orders' }) // Loại bỏ trường orders từ customer
                .populate({ path: 'storeID', select: '-orders' })    // Loại bỏ trường orders từ store
                .populate('payments')
                .populate({
                    path: 'orderDetails',
                    populate: {
                        path: 'productID',
                        populate: {
                            path: 'imageIDs',
                            select: 'imageLink'
                        }
                    }
                });

            const totalOrders = orders.length; // Tính tổng số lượng đơn hàng

            return res.status(200).json({ success: true, totalOrders, orders });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // Lấy chi tiết đơn hàng
    async getOrderById(req, res) {
        try {
            const order = await Order.findById(req.params.orderId)
                .populate({ path: 'customerID', select: '-orders' }) // Loại bỏ trường orders từ customer
                .populate({ path: 'storeID', select: '-orders' })    // Loại bỏ trường orders từ store
                .populate('payments')
                .populate({
                    path: 'orderDetails',
                    populate: {
                        path: 'productID',
                        populate: {
                            path: 'imageIDs',
                            select: 'imageLink'
                        }
                    }
                });

            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            return res.status(200).json({ success: true, order });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // Cập nhật đơn hàng
    async updateOrder(req, res) {
        try {
            const { status, description, cashPaid, bankPaid } = req.body;
            const orderId = req.params.orderId;

            const order = await Order.findById(orderId).populate('orderDetails');

            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            // Kiểm tra trạng thái đơn hàng
            if (order.status !== 'pending' && order.status !== 'not enough') {
                return res.status(400).json({ success: false, message: "Đơn đã xử lý" });
            }

            // Kiểm tra và cập nhật tiền đã trả
            if (cashPaid || bankPaid) {
                // Nếu status không phải là 'paid', trả về lỗi
                if (status !== 'paid') {
                    return res.status(400).json({ success: false, message: "Invalid status for payment update" });
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
                } else {
                    order.status = 'not enough';
                }

                // Nếu status là 'not enough', cập nhật lại status nếu đã thanh toán đủ
                if (order.status === 'not enough' && order.remainingAmount <= 0) {
                    order.status = 'paid';
                }
            } else if (status) {
                // Cập nhật trạng thái khác (nếu có)
                if (status === 'cancelled') {
                    order.status = 'cancelled';
                } else {
                    order.status = status;
                }
            }

            if (description) {
                order.description = description;
            }

            await order.save();
            return res.status(200).json({ success: true, message: "Order updated", order });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
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
                return res.status(404).json({ success: false, message: 'Order not found' });
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

            return res.status(200).json({ success: true, message: 'Order deleted' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // Lấy lợi nhuận và số lượng đơn hàng hàng ngày
    async getDailyProfitAndQuantity(req, res) {
        try {
            const { date } = req.query; // Nhận ngày từ query string
    
            // Kiểm tra nếu date không hợp lệ
            if (!date) {
                return res.status(400).json({ success: false, message: 'Date is required' });
            }
    
            // Chuyển đổi ngày thành định dạng đầu ngày và cuối ngày
            const startDate = new Date(date);
            const endDate = new Date(date);
    
            if (isNaN(startDate.getTime())) {
                return res.status(400).json({ success: false, message: 'Invalid date format' });
            }
    
            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(23, 59, 59, 999);
    
            console.log("Start Date:", startDate.toISOString());
            console.log("End Date:", endDate.toISOString());
    
            // Tìm tất cả các đơn hàng trong khoảng thời gian của ngày đó và có trạng thái là 'paid'
            const orders = await Order.find({
                date: {
                    $gte: startDate,
                    $lte: endDate
                },
                status: 'paid'
            }).populate('orderDetails');
    
            console.log("Orders found:", orders);
    
            // Kiểm tra nếu không có đơn hàng nào
            if (orders.length === 0) {
                return res.status(200).json({ success: true, date, totalProfit: 0, totalQuantity: 0 });
            }
    
            // Tính tổng lợi nhuận và tổng số sản phẩm bán
            let totalProfit = 0;
            let totalQuantity = 0;
    
            orders.forEach(order => {
                totalProfit += order.totalProfit;
                totalQuantity += order.orderDetails.reduce((sum, detail) => sum + detail.quantity, 0);
            });
    
            return res.status(200).json({ success: true, date, totalProfit, totalQuantity });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }
    
    async updateByAdmin(req, res) {
        try {
            const { status } = req.body;
            const orderId = req.params.orderId;

            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            // Cập nhật trạng thái của đơn hàng
            if (status) {
                if (status === 'cancelled') {
                    order.status = 'cancelled';
                } else if (status === 'pending') {
                    order.status = 'pending';
                } else if (status === 'paid') {
                    order.status = 'paid';
                } else if (status === 'not enough') {
                    order.status = 'not enough';
                } else {
                    return res.status(400).json({ success: false, message: "Invalid status value" });
                }
            }

            await order.save();
            return res.status(200).json({ success: true, message: "Order status updated", order });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }
}

const orderController = new OrderController();
module.exports = {
    createOrder: orderController.createOrder.bind(orderController),
    createOrderOnMobile: orderController.createOrderOnMobile.bind(orderController),
    getAllOrders: orderController.getAllOrders.bind(orderController),
    getOrderById: orderController.getOrderById.bind(orderController),
    updateOrder: orderController.updateOrder.bind(orderController),
    deleteOrder: orderController.deleteOrder.bind(orderController),
    getDailyProfitAndQuantity: orderController.getDailyProfitAndQuantity.bind(orderController),
    updateByAdmin: orderController.updateByAdmin.bind(orderController)
};
