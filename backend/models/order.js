const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: { type: String, required: true },
        name: { type: String, required: true },
        unitPrice: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    shippingInfo: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      phoneNo: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    paymentMethod: { type: String, required: true },
    returnRequest: {
      reason: String,
      status: { type: String, enum: ["requested", "approved", "rejected"] },
      requestedAt: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);