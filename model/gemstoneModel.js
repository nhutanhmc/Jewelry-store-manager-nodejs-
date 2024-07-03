const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GemstoneSchema = new Schema(
  {
    name: { type: String, required: true },
    size: { type: String, required: true },
    processingFeeId: { type: Schema.Types.ObjectId, ref: 'ProcessingFee', required: true },
    priceOfGem: { type: Number, required: true }
  },
  { timestamps: true }
);

const Gemstone = mongoose.model("Gemstone", GemstoneSchema);
module.exports = Gemstone;
