const Cart = require("../models/cart");
const Product = require("../models/product");
const { discountedPrice } = require("../utils/pricing");

const populateCart = (cart) =>
  cart.populate({ path: "items.product", select: "name photos variants isDeleted" });

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
    const { productId, variant, quantity = 1 } = req.body;
    const product = await Product.findOne({ _id: productId, isDeleted: false });
    if (!product) return res.status(404).json({ message: "Product not found" });
    const v = product.variants.find((x) => x.label === variant);
    if (!v) return res.status(400).json({ message: "Invalid variant" });
    if (v.stock < quantity)
      return res.status(400).json({ message: "Not enough stock" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existing = cart.items.find(
      (i) => i.product.toString() === productId && i.variant === variant,
    );
    if (existing) existing.quantity += Number(quantity);
    else cart.items.push({ product: productId, variant, quantity: Number(quantity) });

    await cart.save();
    await populateCart(cart);
    res.json({ success: true, cart, unitPrice: discountedPrice(v) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId, variant, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart is empty" });
    const item = cart.items.find(
      (i) => i.product.toString() === productId && i.variant === variant,
    );
    if (!item) return res.status(404).json({ message: "Item not in cart" });
    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter(
        (i) => !(i.product.toString() === productId && i.variant === variant),
      );
    } else item.quantity = Number(quantity);
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
