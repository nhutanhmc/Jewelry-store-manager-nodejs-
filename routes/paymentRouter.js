const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const { authenticateToken } = require('../config/authWithJWT');

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: API endpoints for managing payment methods
 */

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payment methods
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all payment methods
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new payment method
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment method created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       500:
 *         description: Internal server error
 */
router.route('/')
    .get(paymentController.getAllPayments)
    .post(paymentController.createPayment);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get a payment method by ID
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment method found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Payment method not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a payment method by ID
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment method updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Payment method not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a payment method by ID
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment method deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Payment method not found
 *       500:
 *         description: Internal server error
 */
router.route('/:id')
    .get(paymentController.getPaymentById)
    .put(paymentController.updatePayment)
    .delete(paymentController.deletePayment);

module.exports = router;
