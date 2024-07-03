const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MaterialSchema = new Schema({
  name: { type: String, required: true },
  processingFeeId: { type: Schema.Types.ObjectId, ref: 'ProcessingFee', required: true },
  pricePerGram: { type: Number, required: true },
}, { timestamps: true });

const Material = mongoose.model("Material", MaterialSchema);
module.exports = Material;
