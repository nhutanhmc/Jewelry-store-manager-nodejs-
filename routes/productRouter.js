const express = require('express');
const router = express.Router();
const ProductController = require('../controller/ProductController');
const upload = require("../config/uploadMiddleware");

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Upload product images
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               name:
 *                 type: string
 *               size:
 *                 type: string
 *               weight:
 *                 type: number
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               color:
 *                 type: string
 *               materialID:
 *                 type: string
 *               gemstoneID:
 *                 type: string
 *               productTypeID:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request (e.g., missing images or invalid format)
 *       500:
 *         description: Internal server error
 */
router.post('/', upload.array('images'), ProductController.uploadImage_Api);

/**
 * @swagger
 * /products/{id}/images:
 *   put:
 *     summary: Update product images by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product images updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/images', upload.array('images'), ProductController.updateProductImages_Api);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           description: The page number
 *       - in: query
 *         name: sl
 *         schema:
 *           type: integer
 *           description: The number of products per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: The name of the product to search for
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', ProductController.getAllProduct_Api);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', ProductController.deleteProduct_Api);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Product]
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', ProductController.updateProduct_Api);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', ProductController.getByID_Api);

module.exports = router;
