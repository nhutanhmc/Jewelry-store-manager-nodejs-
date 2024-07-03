const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProcessingFeeSchema = new Schema(
  {
    name: { type: String, required: true },
    feeRate: { type: Number, required: true } // tỉ lệ tiền công trên sản phẩm
  },
  { timestamps: true }
);

const ProcessingFee = mongoose.model("ProcessingFee", ProcessingFeeSchema);
module.exports = ProcessingFee;
