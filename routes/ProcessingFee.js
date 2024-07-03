var express = require("express");
const processingFeeController = require("../controller/processingFeeController");
const { authenticateToken } = require("../config/authWithJWT");
var router = express.Router();

router.route("/")
  .all(authenticateToken)
  .get(processingFeeController.getProcessingFeesList_Api)
  .post(processingFeeController.createProcessingFee_Api);

router.route("/:id")
  .all(authenticateToken)
  .get(processingFeeController.getProcessingFeeById_Api)
  .delete(processingFeeController.deleteProcessingFeeById_Api)
  .put(processingFeeController.updateProcessingFeeById_Api);

module.exports = router;
