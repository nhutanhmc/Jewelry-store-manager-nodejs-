const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const { authenticateToken } = require('../config/authWithJWT');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API endpoints for managing orders
 */

/**
 * @swagger
 * /orders/daily-profit:
 *   get:
 *     summary: Get profit and quantity of orders
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: integer
 *           description: The day of the month to get profit and quantity for (1-31)
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           description: The month to get profit and quantity for (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           description: The year to get profit and quantity for
 *       - in: query
 *         name: storeID
 *         schema:
 *           type: string
 *           description: The ID of the store to filter orders by
 *     responses:
 *       200:
 *         description: Profit and quantity of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 totalProfit:
 *                   type: number
 *                 totalQuantity:
 *                   type: number
 *                 paid:
 *                   type: integer
 *                 pending:
 *                   type: integer
 *                 cancelled:
 *                   type: integer
 *                 notEnough:
 *                   type: integer
 *                 monthlyProfitDifference:
 *                   type: number
 *                 monthlyProfitPercentageChange:
 *                   type: number
 *                 yearlyProfitDifference:
 *                   type: number
 *                 yearlyProfitPercentageChange:
 *                   type: number
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/daily-profit', orderController.getDailyProfitAndQuantity);

router.use(authenticateToken); // Sử dụng middleware xác thực cho tất cả các route

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           description: The status of the orders to filter by
 *       - in: query
 *         name: customerName
 *         schema:
 *           type: string
 *           description: The name of the customer to search for
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 totalOrders:
 *                   type: number
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerID:
 *                 type: string
 *               storeID:
 *                 type: string
 *               description:
 *                 type: string
 *               payments:
 *                 type: array
 *                 items:
 *                   type: string
 *               orderDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productID:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     totalProfit:
 *                       type: number
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       500:
 *         description: Internal server error
 */
router.route('/')
    .get(orderController.getAllOrders)
    .post(orderController.createOrder);

/**
 * @swagger
 * /orders/mobile:
 *   post:
 *     summary: Create a new order for Mobile
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerID:
 *                 type: string
 *               storeID:
 *                 type: string
 *               description:
 *                 type: string
 *               payments:
 *                 type: array
 *                 items:
 *                   type: string
 *               orderDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productID:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     totalProfit:
 *                       type: number
 *               deviceToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       500:
 *         description: Internal server error
 */
router.post('/mobile', orderController.createOrderOnMobile);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update an order by ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               description:
 *                 type: string
 *               cashPaid:
 *                 type: number
 *               bankPaid:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete an order by ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.route('/:orderId')
    .get(orderController.getOrderById)
    .put(orderController.updateOrder)
    .delete(orderController.deleteOrder);

/**
 * @swagger
 * /orders/{orderId}/update-status:
 *   put:
 *     summary: Update order status by Admin
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['pending', 'paid', 'cancelled', 'not enough']
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put('/:orderId/update-status', orderController.updateByAdmin);

module.exports = router;
