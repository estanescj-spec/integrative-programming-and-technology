const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Enter category name"],
      unique: true,
      enum: [
        "Lego Sets",
        "RC Cars",
        "Hot Wheels",
        "Nerf Blasters",
        "Puzzles",
        "Plush Toys",
      ],
    },
    description: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);