const express = require('express');
const router = express.Router();
const orderDetailController = require('../controller/orderDetailController');
const { authenticateToken } = require('../config/authWithJWT');

router.use(authenticateToken);

router.route('/')
    .post(orderDetailController.createOrderDetail) // Thêm sản phẩm vào đơn hàng
    .get(orderDetailController.getAllOrderDetails);

router.route('/:orderDetailId')
    .get(orderDetailController.getOrderDetailById) // Lấy chi tiết sản phẩm trong đơn hàng
    .put(orderDetailController.updateOrderDetail) // Cập nhật số lượng sản phẩm
    .delete(orderDetailController.deleteOrderDetail); // Xóa sản phẩm khỏi đơn hàng

module.exports = router;
