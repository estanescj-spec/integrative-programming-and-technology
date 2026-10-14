const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const { orderTotal } = require("../utils/pricing");

exports.getDashboard = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const deliveredQuery = { status: "delivered" };
    if (from || to) deliveredQuery.createdAt = dateFilter;

    const [users, products, allOrders, delivered] = await Promise.all([
      User.countDocuments({ isDeleted: false, role: "customer" }),
      Product.countDocuments({ isDeleted: false }),
      Order.find().populate("user", "name"),
      Order.find(deliveredQuery).populate("user", "name"),
    ]);

    const totalSales = delivered.reduce((s, o) => s + orderTotal(o), 0);

    const byDay = {};
    delivered.forEach((o) => {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      byDay[key] = (byDay[key] || 0) + orderTotal(o);
    });
    const labels = Object.keys(byDay).sort();
    const data = labels.map((k) => byDay[k]);

    const productMap = {};
    const categoryMap = {};
    const userMap = {};

    delivered.forEach((o) => {
      const uname = o.user?.name || "Unknown";
      const ot = orderTotal(o);
      userMap[uname] = (userMap[uname] || 0) + ot;
      o.items.forEach((item) => {
        productMap[item.name] = (productMap[item.name] || 0) + item.unitPrice * item.quantity;
      });
    });

    const productsAll = await Product.find({ isDeleted: false });
    const nameToCat = Object.fromEntries(productsAll.map((p) => [p.name, p.category]));
    Object.entries(productMap).forEach(([name, amt]) => {
      const cat = nameToCat[name] || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + amt;
    });

    const toBreakdown = (map) => {
      const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const sum = entries.reduce((s, [, v]) => s + v, 0) || 1;
      return entries.map(([name, amount]) => ({
        name,
        amount,
        percent: Math.round((amount / sum) * 1000) / 10,
      }));
    };

    res.json({
      success: true,
      stats: {
        totalSales,
        totalOrders: allOrders.length,
        totalUsers: users,
        totalProducts: products,
      },
      chart: { labels, data },
      breakdowns: {
        product: toBreakdown(productMap),
        category: toBreakdown(categoryMap),
        user: toBreakdown(userMap),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { name, role, isActive } = req.body;
    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isDeleted = true;
    await user.save();
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
