const express = require('express');
const router = express.Router();
const storeController = require('../controller/storeController');
const { authenticateToken } = require('../config/authWithJWT');

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: API endpoints for managing stores
 */

/**
 * @swagger
 * /stores:
 *   get:
 *     summary: Get all stores
 *     tags: [Stores]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all stores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stores:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Store'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new store
 *     tags: [Stores]
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
 *               phone:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Store created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       500:
 *         description: Internal server error
 */
router.route('/')
    .get(storeController.getAllStores)
    .post(storeController.createStore);

/**
 * @swagger
 * /stores/{id}:
 *   get:
 *     summary: Get a store by ID
 *     tags: [Stores]
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
 *         description: Store found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       404:
 *         description: Store not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a store by ID
 *     tags: [Stores]
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
 *               phone:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Store updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       404:
 *         description: Store not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a store by ID
 *     tags: [Stores]
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
 *         description: Store deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Store deleted"
 *       404:
 *         description: Store not found
 *       500:
 *         description: Internal server error
 */
router.route('/:id')
    .get(storeController.getStoreById)
    .put(storeController.updateStore)
    .delete(storeController.deleteStore);

module.exports = router;
