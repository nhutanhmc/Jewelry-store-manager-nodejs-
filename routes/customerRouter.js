const express = require('express');
const router = express.Router();
const customerController = require('../controller/customerController');
const { authenticateToken } = require('../config/authWithJWT');

// Middleware xác thực cho tất cả các route
router.use(authenticateToken);

router.route('/')
    .get(customerController.getAllCustomers)
    .post(customerController.createCustomer);

router.route('/:id')
    .get(customerController.getCustomerById)
    .put(customerController.updateCustomer)
    .delete(customerController.deleteCustomer);

router.patch('/:id/activate', customerController.activateCustomer);

module.exports = router;
