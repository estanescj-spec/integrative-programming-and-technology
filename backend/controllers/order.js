const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Payment = require("../models/payment");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const { discountedPrice, orderTotal } = require("../utils/pricing");
const { buildReceiptPdf, orderEmailHtml } = require("../utils/receipt");

const restock = (items) =>
  Promise.all(
    items.map((it) =>
      Product.updateOne(
        { _id: it.product, "variants.label": it.variant },
        { $inc: { "variants.$.stock": it.quantity } },
      ),
    ),
  );

exports.createOrder = async (req, res) => {
  const reserved = [];
  const restore = () => restock(reserved.splice(0));
  let order;

  try {
    const { shippingInfo, paymentMethod, items: picked } = req.body;
    const address = (shippingInfo?.address || "").trim();
    const phoneNo = (shippingInfo?.phoneNo || "").trim();
    if (!address)
      return res.status(400).json({ message: "Address is required" });
    if (!/^[0-9+\-\s]{7,15}$/.test(phoneNo))
      return res.status(400).json({ message: "Enter a valid phone number" });
    if (!["Cash on Delivery", "Card", "GCash"].includes(paymentMethod))
      return res.status(400).json({ message: "Select a payment method" });
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );
    if (!cart || !cart.items.length)
      return res.status(400).json({ message: "Cart is empty" });

    const isPicked = (line) =>
      !Array.isArray(picked) ||
      picked.some(
        (p) =>
          String(p.productId) === String(line.product?._id) &&
          p.variant === line.variant,
      );
    const lines = cart.items.filter(isPicked);
    if (!lines.length)
      return res.status(400).json({ message: "Select at least one item" });

    // 1. validate everything before touching stock
    const items = [];
    for (const line of lines) {
      const product = line.product;
      if (!product || product.isDeleted)
        return res
          .status(400)
          .json({ message: "A product in your cart is unavailable" });
      const v = product.variants.find((x) => x.label === line.variant);
      if (!v) return res.status(400).json({ message: "Invalid variant" });
      if (v.stock < line.quantity)
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.name}` });
      items.push({
        product: product._id,
        variant: line.variant,
        name: product.name,
        unitPrice: discountedPrice(v),
        quantity: line.quantity,
      });
    }

    // 2. atomic stock decrement (never below zero), roll back on failure
    for (const it of items) {
      const result = await Product.updateOne(
        {
          _id: it.product,
          variants: {
            $elemMatch: { label: it.variant, stock: { $gte: it.quantity } },
          },
        },
        { $inc: { "variants.$.stock": -it.quantity } },
      );
      if (!result.modifiedCount) {
        await restore();
        return res
          .status(400)
          .json({ message: `Not enough stock for ${it.name}` });
      }
      reserved.push(it);
    }

    order = await Order.create({
      user: req.user._id,
      items,
      shippingInfo: { address, phoneNo },
      paymentMethod,
      status: "pending",
    });

    await Payment.create({
      order: order._id,
      method: paymentMethod,
      amount: orderTotal(order),
      status: paymentMethod === "Cash on Delivery" ? "pending" : "confirmed",
      paidAt: paymentMethod === "Cash on Delivery" ? undefined : new Date(),
    });

    // 3. remove only the purchased lines from the cart
    cart.items = cart.items
      .filter((l) => l.product && !isPicked(l))
      .map((l) => ({
        product: l.product._id,
        variant: l.variant,
        quantity: l.quantity,
      }));
    await cart.save();
    await notify(order, req.user, "Toy Haven — Order placed");
    res.status(201).json({ success: true, order });
  } catch (err) {
    if (order && reserved.length) await Order.deleteOne({ _id: order._id });
    await restore();
    res.status(400).json({ message: err.message });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name photos variants isDeleted")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.product",
      "name photos variants isDeleted",
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    )
      return res.status(403).json({ message: "Not allowed" });
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

const NEXT = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
};

const notify = async (order, user, subject) => {
  try {
    const pdf = await buildReceiptPdf(order, user);
    await sendEmail({
      email: user.email,
      subject,
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
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!(NEXT[order.status] || []).includes(status))
      return res.status(400).json({
        message: `Can't change an order from ${order.status} to ${status}`,
      });
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      { status },
      { new: true },
    );
    if (!updated)
      return res
        .status(409)
        .json({ message: "Order was just changed. Refresh and try again." });
    order.status = status;
    if (status === "cancelled") {
      await restock(order.items);
      await Payment.updateOne({ order: order._id }, { status: "cancelled" });
    }
    if (status === "delivered")
      await Payment.updateOne(
        { order: order._id },
        { status: "confirmed", paidAt: new Date() },
      );

    const user = await User.findById(order.user);
    if (user) await notify(order, user, `Toy Haven — Order ${order.status}`);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.decideReturn = async (req, res) => {
  try {
    const { decision } = req.body;
    if (!["approved", "rejected"].includes(decision))
      return res
        .status(400)
        .json({ message: "Decision must be approved or rejected" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.returnRequest?.status !== "requested")
      return res.status(400).json({ message: "No pending return request" });

    order.returnRequest.status = decision;
    if (decision === "approved") order.status = "returned";
    await order.save();
    if (decision === "approved") await restock(order.items);

    const user = await User.findById(order.user);
    if (user) await notify(order, user, `Toy Haven — Return ${decision}`);
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        status: { $in: ["pending", "processing"] },
      },
      { status: "cancelled" },
      { new: true },
    );
    if (!order)
      return res.status(400).json({ message: "Order can't be cancelled" });
    await restock(order.items);
    await Payment.updateOne({ order: order._id }, { status: "cancelled" });
    await notify(order, req.user, "Toy Haven — Order cancelled");
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateShipping = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not allowed" });
    if (order.status !== "pending")
      return res.status(400).json({
        message: "Shipping can only be edited while the order is pending",
      });

    const address = (req.body.address || "").trim();
    const phoneNo = (req.body.phoneNo || "").trim();
    if (!address)
      return res.status(400).json({ message: "Address is required" });
    if (!/^[0-9+\-\s]{7,15}$/.test(phoneNo))
      return res.status(400).json({ message: "Enter a valid phone number" });
    order.shippingInfo = { address, phoneNo };
    await order.save();
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
      return res
        .status(400)
        .json({ message: "Only delivered orders can be returned" });
    if (order.returnRequest?.status)
      return res
        .status(400)
        .json({ message: "A return was already requested for this order" });

    const reason = (req.body.reason || "").trim();
    if (reason.length < 5)
      return res
        .status(400)
        .json({ message: "Please explain the reason (at least 5 characters)" });

    order.returnRequest = {
      reason,
      status: "requested",
      requestedAt: new Date(),
    };
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
