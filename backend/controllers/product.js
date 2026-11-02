const mongoose = require("mongoose");
const Product = require("../models/product");
const { discountedPrice } = require("../utils/pricing");
const { uploadImage, destroyImage } = require("../utils/cloudinary");
const Category = require("../models/category");

exports.getCategories = async (req, res) => {
  try {
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
      categories,
      minPrice,
      maxPrice,
      minRating,
      hasReviews,
      deals,
      sort,
      page = 1,
      limit = 8,
    } = req.query;
    const filter = { isDeleted: false };
    if (keyword)
      filter.name = {
        $regex: keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    if (categories) filter.categories = { $in: categories.split(",") };
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

    if (sort === "price_asc" || sort === "price_desc") {
      const low = (p) => Math.min(...p.variants.map((v) => discountedPrice(v)));
      products.sort((a, b) =>
        sort === "price_asc" ? low(a) - low(b) : low(b) - low(a),
      );
    }

    const total = products.length;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 8));
    const pages = Math.max(1, Math.ceil(total / limitNum));
    const data = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    res.json({ success: true, products: data, total, page: pageNum, pages });
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

const parseVariants = (variants) => variants;

const cleanCategories = async (input) => {
  const cats = [...new Set([].concat(input || []).filter(Boolean))];
  if (cats.length) {
    const found = await Category.countDocuments({
      name: { $in: cats },
      isDeleted: false,
    });
    if (found !== cats.length) throw new Error("Select valid categories");
  }
  return cats;
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, categories, variants, photos } = req.body;
    const cats = await cleanCategories(categories);
    const parsed = parseVariants(variants)?.map((v) => ({
      label: v.label,
      price: Number(v.price),
      discountPercent: Number(v.discountPercent || 0),
      stock: Number(v.stock),
      photoIndex:
        v.photoIndex === "" || v.photoIndex == null
          ? undefined
          : Number(v.photoIndex),
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
      categories: cats,
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

    const { name, description, categories, variants, photos, removePhotoIds } =
      req.body;
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (categories !== undefined)
      product.categories = await cleanCategories(categories);
    if (variants) {
      const parsed = parseVariants(variants).map((v) => ({
        ...(v._id && { _id: v._id }),
        label: v.label,
        price: Number(v.price),
        discountPercent: Number(v.discountPercent || 0),
        stock: Number(v.stock),
        photoIndex:
          v.photoIndex === "" || v.photoIndex == null
            ? undefined
            : Number(v.photoIndex),
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
    const ids = (Array.isArray(req.body.ids) ? req.body.ids : []).filter(
      mongoose.isValidObjectId,
    );
    if (!ids.length)
      return res.status(400).json({ message: "Select products to delete" });

    const r = await Product.updateMany(
      { _id: { $in: ids }, isDeleted: false },
      { isDeleted: true },
    );
    res.json({ success: true, message: `${r.modifiedCount} products deleted` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
