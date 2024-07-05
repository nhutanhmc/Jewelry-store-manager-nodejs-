var express = require("express");
const processingFeeController = require("../controller/processingFeeController");
const { authenticateToken } = require("../config/authWithJWT");
var router = express.Router();

router.route("/")
  .all(authenticateToken)
  /**
   * @swagger
   * /processingFees:
   *   get:
   *     summary: Get all processing fees
   *     tags: [ProcessingFees]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: List of all processing fees
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 fees:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ProcessingFee'
   *       500:
   *         description: Internal server error
   *   post:
   *     summary: Create a new processing fee
   *     tags: [ProcessingFees]
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
   *               feeRate:
   *                 type: number
   *     responses:
   *       201:
   *         description: Processing fee created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProcessingFee'
   *       500:
   *         description: Internal server error
   */
  .get(processingFeeController.getProcessingFeesList_Api)
  .post(processingFeeController.createProcessingFee_Api);

router.route("/:id")
  .all(authenticateToken)
  /**
   * @swagger
   * /processingFees/{id}:
   *   get:
   *     summary: Get a processing fee by ID
   *     tags: [ProcessingFees]
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
   *         description: Processing fee found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProcessingFee'
   *       404:
   *         description: Processing fee not found
   *       500:
   *         description: Internal server error
   *   delete:
   *     summary: Delete a processing fee by ID
   *     tags: [ProcessingFees]
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
   *         description: Processing fee deleted successfully
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
   *         description: Processing fee not found
   *       500:
   *         description: Internal server error
   *   put:
   *     summary: Update a processing fee by ID
   *     tags: [ProcessingFees]
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
   *               feeRate:
   *                 type: number
   *     responses:
   *       200:
   *         description: Processing fee updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProcessingFee'
   *       404:
   *         description: Processing fee not found
   *       500:
   *         description: Internal server error
   */
  .get(processingFeeController.getProcessingFeeById_Api)
  .delete(processingFeeController.deleteProcessingFeeById_Api)
  .put(processingFeeController.updateProcessingFeeById_Api);

module.exports = router;
