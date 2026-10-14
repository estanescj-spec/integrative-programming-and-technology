const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Payment = require("../models/payment");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const { discountedPrice, orderTotal } = require("../utils/pricing");
const { buildReceiptPdf, orderEmailHtml } = require("../utils/receipt");

exports.createOrder = async (req, res) => {
  try {
    const { shippingInfo, paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || !cart.items.length)
      return res.status(400).json({ message: "Cart is empty" });

    const items = [];
    for (const line of cart.items) {
      const product = line.product;
      if (!product || product.isDeleted)
        return res.status(400).json({ message: "A product in your cart is unavailable" });
      const v = product.variants.find((x) => x.label === line.variant);
      if (!v) return res.status(400).json({ message: "Invalid variant" });
      if (v.stock < line.quantity)
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      v.stock -= line.quantity;
      product.markModified("variants");
      await product.save();
      items.push({
        product: product._id,
        variant: line.variant,
        name: product.name,
        unitPrice: discountedPrice(v),
        quantity: line.quantity,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingInfo,
      paymentMethod,
      status: "pending",
    });

    const amount = orderTotal(order);
    await Payment.create({
      order: order._id,
      method: paymentMethod,
      amount,
      status: paymentMethod === "Cash on Delivery" ? "pending" : "confirmed",
      paidAt: paymentMethod === "Cash on Delivery" ? undefined : new Date(),
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = status;
    await order.save();

    const user = await User.findById(order.user);
    try {
      const pdf = await buildReceiptPdf(order, user);
      await sendEmail({
        email: user.email,
        subject: `Toy Haven — Order ${order.status}`,
        message: orderEmailHtml(order, user),
        attachments: [
          {
            filename: `receipt-${order._id}.pdf`,
            content: pdf,
            contentType: "application/pdf",
          },
        ],
      });
    } catch (e) {
      console.log("Order email not sent:", e.message);
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not allowed" });
    if (order.status !== "delivered")
      return res.status(400).json({ message: "Only delivered orders can be returned" });
    order.returnRequest = {
      reason: req.body.reason,
      status: "requested",
      requestedAt: new Date(),
    };
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
