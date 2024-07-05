const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const { authenticateToken } = require('../config/authWithJWT'); // Giả sử bạn đã có middleware xác thực

router.use(authenticateToken); // Sử dụng middleware xác thực cho tất cả các route

router.get('/daily-profit', orderController.getDailyProfitAndQuantity);
router.get('/search-by-customer', orderController.searchOrdersByCustomerName);
router.route('/')
    .get(orderController.getAllOrders)
    .post(orderController.createOrder);
router.route('/:orderId')
    .get(orderController.getOrderById)
    .put(orderController.updateOrder)
    .delete(orderController.deleteOrder);

module.exports = router;
