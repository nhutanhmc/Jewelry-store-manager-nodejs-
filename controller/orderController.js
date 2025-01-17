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

    async getDailyProfitAndQuantity(req, res) {
        try {
            const { date, month, year, storeID } = req.query;
    
            // Khởi tạo các biến thời gian
            let startDate, endDate;
            let monthlyStartDate, monthlyEndDate, yearlyStartDate, yearlyEndDate;
            let lastMonthStartDate, lastMonthEndDate, lastYearStartDate, lastYearEndDate;
    
            if (!date && !month && !year) {
                // Không nhập gì hết, tính tổng tất cả
                const orders = await Order.find(storeID ? { storeID } : {}).populate('orderDetails');
    
                let totalProfit = 0;
                let totalQuantity = 0;
                let statusCount = {
                    paid: 0,
                    pending: 0,
                    cancelled: 0,
                    notEnough: 0
                };
    
                orders.forEach(order => {
                    if (order.status === 'paid') {
                        totalProfit += order.totalProfit;
                        totalQuantity += order.orderDetails.reduce((sum, detail) => sum + detail.quantity, 0);
                    }
    
                    if (statusCount.hasOwnProperty(order.status)) {
                        statusCount[order.status] += 1;
                    }
                });
    
                const totalCustomers = await Customer.countDocuments();
                const newCustomers = await Customer.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } });
    
                return res.status(200).json({
                    success: true,
                    totalProfit,
                    totalQuantity,
                    totalCustomers,
                    newCustomers,
                    ...statusCount
                });
            }
    
            if (date && month && year) {
                // Tìm kiếm theo ngày cụ thể
                startDate = new Date(year, month - 1, date);
                endDate = new Date(year, month - 1, date);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate.setUTCHours(23, 59, 59, 999);
    
                // Tìm kiếm theo tháng của ngày đã nhập
                monthlyStartDate = new Date(year, month - 1, 1);
                monthlyEndDate = new Date(year, month, 0);
                monthlyStartDate.setUTCHours(0, 0, 0, 0);
                monthlyEndDate.setUTCHours(23, 59, 59, 999);
    
                // Tìm kiếm theo tháng của tháng trước
                if (month == 1) {
                    lastMonthStartDate = new Date(year - 1, 11, 1);
                    lastMonthEndDate = new Date(year - 1, 11, 31);
                } else {
                    lastMonthStartDate = new Date(year, month - 2, 1);
                    lastMonthEndDate = new Date(year, month - 1, 0);
                }
                lastMonthStartDate.setUTCHours(0, 0, 0, 0);
                lastMonthEndDate.setUTCHours(23, 59, 59, 999);
    
                // Tìm kiếm theo năm của ngày đã nhập
                yearlyStartDate = new Date(year, 0, 1);
                yearlyEndDate = new Date(year, 11, 31);
                yearlyStartDate.setUTCHours(0, 0, 0, 0);
                yearlyEndDate.setUTCHours(23, 59, 59, 999);
    
                // Tìm kiếm theo năm của năm trước
                lastYearStartDate = new Date(year - 1, 0, 1);
                lastYearEndDate = new Date(year - 1, 11, 31);
                lastYearStartDate.setUTCHours(0, 0, 0, 0);
                lastYearEndDate.setUTCHours(23, 59, 59, 999);
    
            } else if (month && year) {
                // Tìm kiếm theo tháng cụ thể
                startDate = new Date(year, month - 1, 1);
                endDate = new Date(year, month, 0);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate.setUTCHours(23, 59, 59, 999);
    
                // Tìm kiếm theo tháng của tháng trước
                if (month == 1) {
                    lastMonthStartDate = new Date(year - 1, 11, 1);
                    lastMonthEndDate = new Date(year - 1, 11, 31);
                } else {
                    lastMonthStartDate = new Date(year, month - 2, 1);
                    lastMonthEndDate = new Date(year, month - 1, 0);
                }
                lastMonthStartDate.setUTCHours(0, 0, 0, 0);
                lastMonthEndDate.setUTCHours(23, 59, 59, 999);
    
                // Tìm kiếm theo năm của tháng đã nhập
                yearlyStartDate = new Date(year, 0, 1);
                yearlyEndDate = new Date(year, 11, 31);
                yearlyStartDate.setUTCHours(0, 0, 0, 0);
                yearlyEndDate.setUTCHours(23, 59, 59, 999);
    
                // Tìm kiếm theo năm của năm trước
                lastYearStartDate = new Date(year - 1, 0, 1);
                lastYearEndDate = new Date(year - 1, 11, 31);
                lastYearStartDate.setUTCHours(0, 0, 0, 0);
                lastYearEndDate.setUTCHours(23, 59, 59, 999);
    
            } else if (year) {
                // Tìm kiếm theo năm cụ thể
                startDate = new Date(year, 0, 1);
                endDate = new Date(year, 11, 31);
                startDate.setUTCHours(0, 0, 0, 0);
                endDate.setUTCHours(23, 59, 59, 999);
    
                // Tìm kiếm theo năm của năm trước
                lastYearStartDate = new Date(year - 1, 0, 1);
                lastYearEndDate = new Date(year - 1, 11, 31);
                lastYearStartDate.setUTCHours(0, 0, 0, 0);
                lastYearEndDate.setUTCHours(23, 59, 59, 999);
            } else {
                return res.status(400).json({ success: false, message: 'Invalid parameters' });
            }
    
            // Tạo điều kiện tìm kiếm cho ngày/tháng/năm hiện tại
            let query = {
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            };
    
            // Thêm điều kiện lọc theo storeID nếu có
            if (storeID) {
                query.storeID = storeID;
            }
    
            // Tìm tất cả các đơn hàng trong khoảng thời gian đã xác định
            const orders = await Order.find(query).populate('orderDetails');
    
            // Tính tổng lợi nhuận và tổng số sản phẩm bán cho ngày/tháng/năm hiện tại
            let totalProfit = 0;
            let totalQuantity = 0;
            let statusCount = {
                paid: 0,
                pending: 0,
                cancelled: 0,
                notEnough: 0
            };
    
            orders.forEach(order => {
                if (order.status === 'paid') {
                    totalProfit += order.totalProfit;
                    totalQuantity += order.orderDetails.reduce((sum, detail) => sum + detail.quantity, 0);
                }
    
                // Đếm số lượng đơn hàng theo trạng thái
                if (statusCount.hasOwnProperty(order.status)) {
                    statusCount[order.status] += 1;
                }
            });
    
            // Đếm tổng số khách hàng
            const totalCustomers = await Customer.countDocuments();
    
            // Đếm số khách hàng mới tạo trong khoảng thời gian đã xác định
            const newCustomers = await Customer.find({
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).countDocuments();
    
            // Tính lợi nhuận tháng hiện tại
            let monthlyProfit = 0;
            if (month && year) {
                monthlyStartDate = new Date(year, month - 1, 1);
                monthlyEndDate = new Date(year, month, 0);
                monthlyStartDate.setUTCHours(0, 0, 0, 0);
                monthlyEndDate.setUTCHours(23, 59, 59, 999);
                if (monthlyStartDate && monthlyEndDate) {
                    const monthlyOrders = await Order.find({
                        date: {
                            $gte: monthlyStartDate,
                            $lte: monthlyEndDate
                        }
                    }).populate('orderDetails');
    
                    monthlyOrders.forEach(order => {
                        if (order.status === 'paid') {
                            monthlyProfit += order.totalProfit;
                        }
                    });
    
                    console.log(`Lợi nhuận tháng hiện tại (${monthlyStartDate.toISOString()} - ${monthlyEndDate.toISOString()}):`, monthlyProfit);
                }
            }
    
            // Tính lợi nhuận tháng trước (nếu có)
            let lastMonthProfit = 0;
            if (lastMonthStartDate && lastMonthEndDate) {
                const lastMonthOrders = await Order.find({
                    date: {
                        $gte: lastMonthStartDate,
                        $lte: lastMonthEndDate
                    }
                }).populate('orderDetails');
    
                lastMonthOrders.forEach(order => {
                    if (order.status === 'paid') {
                        lastMonthProfit += order.totalProfit;
                    }
                });
    
                console.log(`Lợi nhuận tháng trước (${lastMonthStartDate.toISOString()} - ${lastMonthEndDate.toISOString()}):`, lastMonthProfit);
            }
    
            // Tính lợi nhuận năm hiện tại
            let yearlyProfit = 0;
            yearlyStartDate = new Date(year, 0, 1);
            yearlyEndDate = new Date(year, 11, 31);
            yearlyStartDate.setUTCHours(0, 0, 0, 0);
            yearlyEndDate.setUTCHours(23, 59, 59, 999);
            if (yearlyStartDate && yearlyEndDate) {
                const yearlyOrders = await Order.find({
                    date: {
                        $gte: yearlyStartDate,
                        $lte: yearlyEndDate
                    }
                }).populate('orderDetails');
    
                yearlyOrders.forEach(order => {
                    if (order.status === 'paid') {
                        yearlyProfit += order.totalProfit;
                    }
                });
    
                console.log(`Lợi nhuận năm hiện tại (${yearlyStartDate.toISOString()} - ${yearlyEndDate.toISOString()}):`, yearlyProfit);
            }
    
            // Tính lợi nhuận năm trước (nếu có)
            let lastYearProfit = 0;
            lastYearStartDate = new Date(year - 1, 0, 1);
            lastYearEndDate = new Date(year - 1, 11, 31);
            lastYearStartDate.setUTCHours(0, 0, 0, 0);
            lastYearEndDate.setUTCHours(23, 59, 59, 999);
            if (lastYearStartDate && lastYearEndDate) {
                const lastYearOrders = await Order.find({
                    date: {
                        $gte: lastYearStartDate,
                        $lte: lastYearEndDate
                    }
                }).populate('orderDetails');
    
                lastYearOrders.forEach(order => {
                    if (order.status === 'paid') {
                        lastYearProfit += order.totalProfit;
                    }
                });
    
                console.log(`Lợi nhuận năm trước (${lastYearStartDate.toISOString()} - ${lastYearEndDate.toISOString()}):`, lastYearProfit);
            }
    
            // Tính toán lợi nhuận và phần trăm thay đổi cho tháng và năm
            const monthlyProfitDifference = monthlyProfit - lastMonthProfit;
            const monthlyProfitPercentageChange = lastMonthProfit ? (monthlyProfitDifference / lastMonthProfit) * 100 : 0;
            const yearlyProfitDifference = yearlyProfit - lastYearProfit;
            const yearlyProfitPercentageChange = lastYearProfit ? (yearlyProfitDifference / lastYearProfit) * 100 : 0;
    
            console.log(`Tổng thu nhập tháng hiện tại: ${monthlyProfit}`);
            console.log(`Tổng thu nhập tháng trước: ${lastMonthProfit}`);
            console.log(`monthlyProfitDifference: ${monthlyProfit} - ${lastMonthProfit} = ${monthlyProfitDifference}`);
    
            return res.status(200).json({
                success: true,
                totalProfit: date ? totalProfit : (month ? monthlyProfit : yearlyProfit), // Cập nhật giá trị `totalProfit` dựa trên khoảng thời gian
                totalQuantity,
                totalCustomers,
                newCustomers,
                monthlyProfitDifference,
                monthlyProfitPercentageChange,
                yearlyProfitDifference,
                yearlyProfitPercentageChange,
                ...statusCount
            });
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
