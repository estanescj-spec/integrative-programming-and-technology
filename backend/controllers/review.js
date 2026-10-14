const { Filter } = require("bad-words");
const Review = require("../models/review");
const Order = require("../models/order");
const Product = require("../models/product");

const filter = new Filter();

const recalcRatings = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numOfReviews = reviews.length;
  const ratings =
    numOfReviews === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / numOfReviews;
  await Product.findByIdAndUpdate(productId, {
    numOfReviews,
    ratings: Math.round(ratings * 10) / 10,
  });
};

exports.getProductReviews = async (req, res) => {
  try {
    const { minRating } = req.query;
    const q = { product: req.params.productId };
    if (minRating) q.rating = { $gte: Number(minRating) };
    const reviews = await Review.find(q)
      .populate("user", "name profilePhoto")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const delivered = await Order.findOne({
      user: req.user._id,
      status: "delivered",
      "items.product": productId,
    });
    if (!delivered)
      return res
        .status(403)
        .json({ message: "You can only review products you purchased" });

    const existing = await Review.findOne({
      user: req.user._id,
      product: productId,
    });
    if (existing)
      return res.status(400).json({ message: "You already reviewed this product" });

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: delivered._id,
      rating,
      comment: filter.clean(comment || ""),
    });
    await recalcRatings(productId);
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not allowed" });
    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.comment) review.comment = filter.clean(req.body.comment);
    await review.save();
    await recalcRatings(review.product);
    res.json({ success: true, review });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    const productId = review.product;
    await review.deleteOne();
    await recalcRatings(productId);
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
