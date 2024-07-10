/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: API endpoints for managing customers
 */

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Retrieve a list of customers, optionally filtered by phone number
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Phone number to filter customers
 *     responses:
 *       200:
 *         description: A list of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
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
 *                 example: "John Doe"
 *               age:
 *                 type: number
 *                 example: 30
 *               phone:
 *                 type: string
 *                 example: "123456789"
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *     responses:
 *       201:
 *         description: The created customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get a customer by ID
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: The customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a customer by ID
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               age:
 *                 type: number
 *                 example: 30
 *               phone:
 *                 type: string
 *                 example: "123456789"
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *     responses:
 *       200:
 *         description: The updated customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a customer by ID
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Customer deleted"
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /customers/{id}/activate:
 *   patch:
 *     summary: Activate a customer by ID
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: The activated customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Customer activated"
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /customers/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a customer by ID
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: The deactivated customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Customer deactivated"
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */

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
router.patch('/:id/deactivate', customerController.deactivateCustomer);

module.exports = router;
