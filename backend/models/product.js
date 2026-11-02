const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  label: { type: String, trim: true, default: "Default", set: (v) => (v && v.trim()) || "Default", },
  price: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  photoIndex: { type: Number, min: 0 },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Enter product name"], trim: true, maxLength: 100, },
    description: { type: String, default: "" },
    categories: { type: [String], default: [] },
    photos: [{ public_id: String, url: String }],
    variants: { type: [variantSchema], 
      validate: [(v) => v.length > 0, "Add at least one variant"], },
    ratings: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema
  .path("variants")
  .validate((v) => new Set(v.map((x) => x.label)).size === v.length, "Variant labels must be unique",);

module.exports = mongoose.model("Product", productSchema);
