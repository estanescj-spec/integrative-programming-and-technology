const Product = require("../models/product");
const { discountedPrice } = require("../utils/pricing");
const { uploadImage, destroyImage } = require("../utils/cloudinary");

const Category = require("../models/category");
const { ensureSeed } = require("./category");

exports.getCategories = async (req, res) => {
  try {
    await ensureSeed();
    const cats = await Category.find({ isDeleted: false }).sort({
      createdAt: 1,
    });
    res.json({ success: true, categories: cats.map((c) => c.name) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      minRating,
      hasReviews,
      page = 1,
      limit = 8,
    } = req.query;

    const filter = { isDeleted: false };
    if (keyword)
      filter.name = {
        $regex: keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    if (category) filter.category = category;
    if (minRating) filter.ratings = { $gte: Number(minRating) };
    if (hasReviews === "true") filter.numOfReviews = { $gt: 0 };
    if (deals === "true") filter["variants.discountPercent"] = { $gt: 0 };

    let products = await Product.find(filter).sort({ createdAt: -1 });

    if (minPrice || maxPrice) {
      products = products.filter((p) =>
        p.variants.some((v) => {
          const price = discountedPrice(v);
          if (minPrice && price < Number(minPrice)) return false;
          if (maxPrice && price > Number(maxPrice)) return false;
          return true;
        }),
      );
    }

    const total = products.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const pages = Math.max(1, Math.ceil(total / limitNum));
    const data = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      success: true,
      products: data,
      total,
      page: pageNum,
      pages,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false }).sort({
      createdAt: -1,
    });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const parseVariants = (variants) => {
  if (typeof variants === "string") return JSON.parse(variants);
  return variants;
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, variants, photos } = req.body;

    if (!(await Category.findOne({ name: category, isDeleted: false })))
      return res.status(400).json({ message: "Select a valid category" });

    const parsed = parseVariants(variants)?.map((v) => ({
      label: v.label,
      price: Number(v.price),
      discountPercent: Number(v.discountPercent || 0),
      stock: Number(v.stock),
    }));
    if (!parsed?.length)
      return res.status(400).json({ message: "Add at least one variant" });

    const uploaded = [];
    if (Array.isArray(photos)) {
      for (const photo of photos) {
        uploaded.push(await uploadImage(photo));
      }
    }

    const product = await Product.create({
      name,
      description,
      category,
      variants: parsed,
      photos: uploaded,
    });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, description, category, variants, photos, removePhotoIds } =
      req.body;

    if (
      category &&
      category !== product.category &&
      !(await Category.findOne({ name: category, isDeleted: false }))
    )
      return res.status(400).json({ message: "Select a valid category" });
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (variants) {
      const parsed = parseVariants(variants).map((v) => ({
        ...(v._id && { _id: v._id }),
        label: v.label,
        price: Number(v.price),
        discountPercent: Number(v.discountPercent || 0),
        stock: Number(v.stock),
      }));
      if (!parsed.length)
        return res.status(400).json({ message: "Add at least one variant" });
      product.variants = parsed;
    }

    if (Array.isArray(removePhotoIds) && removePhotoIds.length) {
      for (const id of removePhotoIds) {
        await destroyImage(id);
      }
      product.photos = product.photos.filter(
        (p) => !removePhotoIds.includes(p.public_id),
      );
    }

    if (Array.isArray(photos) && photos.length) {
      for (const photo of photos) {
        product.photos.push(await uploadImage(photo));
      }
    }

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.isDeleted = true;
    await product.save();
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length)
      return res.status(400).json({ message: "Select products to delete" });
    await Product.updateMany({ _id: { $in: ids } }, { isDeleted: true });
    res.json({ success: true, message: `${ids.length} products deleted` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
