const Cart = require("../models/cart");
const Product = require("../models/product");
const { discountedPrice } = require("../utils/pricing");

const populateCart = (cart) =>
  cart.populate({
    path: "items.product",
    select: "name photos variants isDeleted",
  });

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    await populateCart(cart);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, variant } = req.body;
    const qty = Number(req.body.quantity ?? 1);
    if (!Number.isInteger(qty) || qty < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });
    const product = await Product.findOne({ _id: productId, isDeleted: false });
    if (!product) return res.status(404).json({ message: "Product not found" });
    const v = product.variants.find((x) => x.label === variant);
    if (!v) return res.status(400).json({ message: "Invalid variant" });
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    const existing = cart.items.find(
      (i) => i.product.toString() === productId && i.variant === variant,
    );
    const newQty = (existing?.quantity || 0) + qty;
    if (newQty > v.stock)
      return res.status(400).json({
        message: v.stock ? `Only ${v.stock} in stock` : "Out of stock",
      });
    if (existing) existing.quantity = newQty;
    else cart.items.push({ product: productId, variant, quantity: qty });
    await cart.save();
    await populateCart(cart);
    res.json({ success: true, cart, unitPrice: discountedPrice(v) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId, variant } = req.body;
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity))
      return res.status(400).json({ message: "Invalid quantity" });
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart is empty" });
    const item = cart.items.find(
      (i) => i.product.toString() === productId && i.variant === variant,
    );
    if (!item) return res.status(404).json({ message: "Item not in cart" });
    const product = await Product.findOne({ _id: productId, isDeleted: false });
    const v = product?.variants.find((x) => x.label === variant);
    if (!v)
      return res.status(400).json({ message: "Item is no longer available" });
    if (quantity > v.stock)
      return res.status(400).json({
        message: v.stock ? `Only ${v.stock} in stock` : "Out of stock",
      });
    item.quantity = quantity;
    await cart.save();
    await populateCart(cart);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { productId, variant } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart is empty" });
    cart.items = cart.items.filter(
      (i) => !(i.product.toString() === productId && i.variant === variant),
    );
    await cart.save();
    await populateCart(cart);
    res.json({ success: true, cart });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
