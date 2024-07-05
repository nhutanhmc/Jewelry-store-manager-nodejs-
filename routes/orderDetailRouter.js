const express = require('express');
const router = express.Router();
const orderDetailController = require('../controller/orderDetailController');
const { authenticateToken } = require('../config/authWithJWT');

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: OrderDetails
 *   description: API endpoints for managing order details
 */

/**
 * @swagger
 * /orderDetails:
 *   post:
 *     summary: Add products to an order
 *     tags: [OrderDetails]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productID:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               orderID:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order details created or updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orderDetails:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderDetail'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Order or product not found
 *       500:
 *         description: Internal server error
 *   get:
 *     summary: Get all order details
 *     tags: [OrderDetails]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderDetails:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderDetail'
 *       500:
 *         description: Internal server error
 */
router.route('/')
    .post(orderDetailController.createOrderDetail) // Thêm sản phẩm vào đơn hàng
    .get(orderDetailController.getAllOrderDetails);

/**
 * @swagger
 * /orderDetails/{orderDetailId}:
 *   get:
 *     summary: Get an order detail by ID
 *     tags: [OrderDetails]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderDetailId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order detail found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderDetail:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       404:
 *         description: Order detail not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update an order detail by ID
 *     tags: [OrderDetails]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderDetailId
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
 *               productID:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order detail updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orderDetail:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       404:
 *         description: Order detail not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete an order detail by ID
 *     tags: [OrderDetails]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderDetailId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order detail deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Order detail not found
 *       500:
 *         description: Internal server error
 */
router.route('/:orderDetailId')
    .get(orderDetailController.getOrderDetailById) // Lấy chi tiết sản phẩm trong đơn hàng
    .put(orderDetailController.updateOrderDetail) // Cập nhật số lượng sản phẩm
    .delete(orderDetailController.deleteOrderDetail); // Xóa sản phẩm khỏi đơn hàng

module.exports = router;
