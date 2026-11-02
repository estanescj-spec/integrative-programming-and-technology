const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.ObjectId, ref: "Order", required: true, unique: true, },
    method: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "failed", "cancelled"], default: "pending", },
    paidAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);