/**
 * @swagger
 * tags:
 *   name: ProductTypes
 *   description: API endpoints for managing product types
 */

/**
 * @swagger
 * /producttype:
 *   get:
 *     summary: Retrieve a list of product types
 *     tags: [ProductTypes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of product types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 productTypes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductType'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new product type
 *     tags: [ProductTypes]
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
 *                 example: "Necklace"
 *               categoryID:
 *                 type: string
 *                 example: "60d5ec49f8e5a60f3c82e8a4"
 *               description:
 *                 type: string
 *                 example: "A type of jewelry worn around the neck"
 *     responses:
 *       201:
 *         description: The created product type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 newProductType:
 *                   $ref: '#/components/schemas/ProductType'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /producttype/{id}:
 *   get:
 *     summary: Get a product type by ID
 *     tags: [ProductTypes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product type ID
 *     responses:
 *       200:
 *         description: The product type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 productType:
 *                   $ref: '#/components/schemas/ProductType'
 *       404:
 *         description: Product type not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a product type by ID
 *     tags: [ProductTypes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Necklace"
 *               categoryID:
 *                 type: string
 *                 example: "60d5ec49f8e5a60f3c82e8a4"
 *               description:
 *                 type: string
 *                 example: "A type of jewelry worn around the neck"
 *     responses:
 *       200:
 *         description: The updated product type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 updatedProductType:
 *                   $ref: '#/components/schemas/ProductType'
 *       404:
 *         description: Product type not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a product type by ID
 *     tags: [ProductTypes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product type ID
 *     responses:
 *       200:
 *         description: Product type deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Xóa dữ liệu thành công!"
 *       404:
 *         description: Product type not found
 *       500:
 *         description: Server error
 */

var express = require("express");
const productTypeController = require("../controller/productTypeController");
const { authenticateToken } = require("../config/authWithJWT");
var router = express.Router();

router.route("/").all(authenticateToken).get(productTypeController.getProductTypeList_Api).post(productTypeController.createProductType_Api);
router
  .route("/:id")
  .all(authenticateToken)
  .get(productTypeController.getProductTypeById_Api)
  .delete(productTypeController.deleteProductTypeById_Api)
  .put(productTypeController.updateProductTypeById_Api);

module.exports = router;
