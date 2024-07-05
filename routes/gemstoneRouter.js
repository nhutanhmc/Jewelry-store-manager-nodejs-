/**
 * @swagger
 * tags:
 *   name: Gemstones
 *   description: API endpoints for managing gemstones
 */

/**
 * @swagger
 * /gemstone:
 *   get:
 *     summary: Retrieve a list of gemstones
 *     tags: [Gemstones]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of gemstones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 gemstones:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Gemstone'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new gemstone
 *     tags: [Gemstones]
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
 *                 example: "Diamond"
 *               size:
 *                 type: string
 *                 example: "Large"
 *               processingFeeId:
 *                 type: string
 *                 example: "60d5ec49f8e5a60f3c82e8a4"
 *               priceOfGem:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       201:
 *         description: The created gemstone
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   $ref: '#/components/schemas/Gemstone'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /gemstone/{id}:
 *   get:
 *     summary: Get a gemstone by ID
 *     tags: [Gemstones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The gemstone ID
 *     responses:
 *       200:
 *         description: The gemstone
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 gemstone:
 *                   $ref: '#/components/schemas/Gemstone'
 *       404:
 *         description: Gemstone not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a gemstone by ID
 *     tags: [Gemstones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The gemstone ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Diamond"
 *               size:
 *                 type: string
 *                 example: "Large"
 *               processingFeeId:
 *                 type: string
 *                 example: "60d5ec49f8e5a60f3c82e8a4"
 *               priceOfGem:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       200:
 *         description: The updated gemstone
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 gemstone:
 *                   $ref: '#/components/schemas/Gemstone'
 *       404:
 *         description: Gemstone not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a gemstone by ID
 *     tags: [Gemstones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The gemstone ID
 *     responses:
 *       200:
 *         description: Gemstone deleted
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
 *         description: Gemstone not found
 *       500:
 *         description: Server error
 */

var express = require("express");
const gemstoneController = require("../controller/gemstoneController");
const { authenticateToken } = require("../config/authWithJWT");
var router = express.Router();

router.route("/").all(authenticateToken).get(gemstoneController.getGemstonesList_Api).post(gemstoneController.createGemstone_Api);
router
  .route("/:id")
  .all(authenticateToken)
  .get(gemstoneController.getGemstoneById_Api)
  .delete(gemstoneController.deleteGemstoneById_Api)
  .put(gemstoneController.updateGemstoneById_Api);

module.exports = router;
