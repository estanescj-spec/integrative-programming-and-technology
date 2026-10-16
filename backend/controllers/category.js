const Category = require("../models/category");
const Product = require("../models/product");

const DEFAULTS = ["Lego Sets", "RC Cars", "Hot Wheels", "Nerf Blasters", "Puzzles", "Plush Toys"];
const CI = { locale: "en", strength: 2 }; // case-insensitive match

const ensureSeed = async () => {
  if ((await Category.countDocuments()) === 0)
    await Category.insertMany(DEFAULTS.map((name) => ({ name })));
};
exports.ensureSeed = ensureSeed;

exports.getCategoriesAdmin = async (req, res) => {
  try {
    await ensureSeed();
    const categories = await Category.find({ isDeleted: false }).sort({ createdAt: 1 });
    const counts = await Product.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$category", n: { $sum: 1 } } },
    ]);
    const byName = Object.fromEntries(counts.map((c) => [c._id, c.n]));
    res.json({
      success: true,
      categories: categories.map((c) => ({ ...c.toObject(), productCount: byName[c.name] || 0 })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Enter category name" });

    const existing = await Category.findOne({ name }).collation(CI);
    if (existing && !existing.isDeleted)
      return res.status(400).json({ message: "Category already exists" });

    const category = existing || new Category({ name });
    category.isDeleted = false;
    category.description = req.body.description || "";
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) return res.status(404).json({ message: "Category not found" });

    const name = (req.body.name ?? category.name).trim();
    if (!name) return res.status(400).json({ message: "Enter category name" });

    const dup = await Category.findOne({ name, _id: { $ne: category._id }, isDeleted: false }).collation(CI);
    if (dup) return res.status(400).json({ message: "Category already exists" });

    const oldName = category.name;
    category.name = name;
    if (typeof req.body.description === "string") category.description = req.body.description;
    await category.save();

    // keep products in sync when a category is renamed
    if (oldName !== name) await Product.updateMany({ category: oldName }, { category: name });

    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) return res.status(404).json({ message: "Category not found" });
    category.isDeleted = true; // soft delete: products and orders are untouched
    await category.save();
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};