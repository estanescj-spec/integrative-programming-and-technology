const Category = require("../models/category");
const { CATEGORIES } = require("./product");

exports.getCategoriesAdmin = async (req, res) => {
  try {
    const existing = await Category.find({ isDeleted: false });
    const byName = Object.fromEntries(existing.map((c) => [c.name, c]));
    const categories = CATEGORIES.map(
      (name) =>
        byName[name] || { name, description: "", _id: name, isVirtual: true },
    );
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.upsertCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!CATEGORIES.includes(name))
      return res.status(400).json({ message: "Invalid category" });
    const category = await Category.findOneAndUpdate(
      { name },
      { name, description, isDeleted: false },
      { new: true, upsert: true },
    );
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
