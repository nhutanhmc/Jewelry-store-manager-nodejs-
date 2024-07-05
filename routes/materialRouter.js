/**
 * @swagger
 * tags:
 *   name: Materials
 *   description: API endpoints for managing materials
 */

/**
 * @swagger
 * /material:
 *   get:
 *     summary: Retrieve a list of materials
 *     tags: [Materials]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of materials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 materials:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Material'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new material
 *     tags: [Materials]
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
 *                 example: "Gold"
 *               processingFeeId:
 *                 type: string
 *                 example: "60d5ec49f8e5a60f3c82e8a4"
 *               pricePerGram:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: The created material
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   $ref: '#/components/schemas/Material'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /material/{id}:
 *   get:
 *     summary: Get a material by ID
 *     tags: [Materials]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The material ID
 *     responses:
 *       200:
 *         description: The material
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 material:
 *                   $ref: '#/components/schemas/Material'
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a material by ID
 *     tags: [Materials]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Gold"
 *               processingFeeId:
 *                 type: string
 *                 example: "60d5ec49f8e5a60f3c82e8a4"
 *               pricePerGram:
 *                 type: number
 *                 example: 50
 *     responses:
 *       200:
 *         description: The updated material
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 material:
 *                   $ref: '#/components/schemas/Material'
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a material by ID
 *     tags: [Materials]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The material ID
 *     responses:
 *       200:
 *         description: Material deleted
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
 *         description: Material not found
 *       500:
 *         description: Server error
 */

var express = require("express");
const materialController = require("../controller/materialController");
const { authenticateToken } = require("../config/authWithJWT");
var router = express.Router();

router.route("/").all(authenticateToken).get(materialController.getMaterialsList_Api).post(materialController.createMaterial_Api);
router
  .route("/:id")
  .all(authenticateToken)
  .get(materialController.getMaterialById_Api)
  .delete(materialController.deleteMaterialById_Api)
  .put(materialController.updateMaterialById_Api);

module.exports = router;
