const { model, Schema } = require("mongoose");

const productSchema = new Schema({
  productId: String,
  productName: String,
  description: String,
  price: Number,
  quantity: Number,
  categoryIds: [String],
  isActive: Boolean,
  createdAt: Date,
  imageUrl: String,
});
module.exports = model("AutoParts", productSchema);
