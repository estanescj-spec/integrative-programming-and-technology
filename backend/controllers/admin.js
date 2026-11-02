const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const { orderTotal } = require("../utils/pricing");

exports.getDashboard = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from)
      dateFilter.$gte = new Date(new Date(from).getTime() - 8 * 3600000);
    if (to) {
      const end = new Date(to);
      end.setUTCHours(15, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const deliveredQuery = { status: "delivered" };
    if (from || to) deliveredQuery.createdAt = dateFilter;

    const [users, products, totalOrders, delivered, productsAll] =
      await Promise.all([
        User.countDocuments({ isDeleted: false, role: "customer" }),
        Product.countDocuments({ isDeleted: false }),
        Order.countDocuments(from || to ? { createdAt: dateFilter } : {}),
        Order.find(deliveredQuery).populate("user", "name"),
        Product.find({ isDeleted: false }).select("name categories"),
      ]);
    const totalSales = delivered.reduce((s, o) => s + orderTotal(o), 0);
    const byDay = {};
    delivered.forEach((o) => {
      const key = new Date(new Date(o.createdAt).getTime() + 8 * 3600000)
        .toISOString()
        .slice(0, 10);
      byDay[key] = (byDay[key] || 0) + orderTotal(o);
    });
    const labels = Object.keys(byDay).sort();
    const data = labels.map((k) => byDay[k]);

    const productMap = {};
    const categoryMap = {};
    const userMap = {};

    const idToCats = Object.fromEntries(
      productsAll.map((p) => [String(p._id), p.categories]),
    );
    delivered.forEach((o) => {
      const uname = o.user?.name || "Unknown";
      const ot = orderTotal(o);
      userMap[uname] = (userMap[uname] || 0) + ot;
      o.items.forEach((item) => {
        const amt = item.unitPrice * item.quantity;
        productMap[item.name] = (productMap[item.name] || 0) + amt;
        const cats = idToCats[String(item.product)];
        (cats?.length ? cats : ["Other"]).forEach(
          (c) => (categoryMap[c] = (categoryMap[c] || 0) + amt),
        );
      });
    });

    const toBreakdown = (map) => {
      const all = Object.entries(map).sort((a, b) => b[1] - a[1]);
      const sum = all.reduce((s, [, v]) => s + v, 0) || 1;
      return all.slice(0, 5).map(([name, amount]) => ({
        name,
        amount,
        percent: Math.round((amount / sum) * 1000) / 10,
      }));
    };
    res.json({
      success: true,
      stats: {
        totalSales,
        totalOrders,
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
    if (req.params.id === String(req.user._id))
      return res
        .status(400)
        .json({ message: "You can't change your own account here" });

    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, role, isActive } = req.body;
    if (name) user.name = name;
    if (role) {
      if (!["customer", "admin"].includes(role))
        return res.status(400).json({ message: "Invalid role" });
      user.role = role;
    }
    if (typeof isActive === "boolean") user.isActive = isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === String(req.user._id))
      return res
        .status(400)
        .json({ message: "You can't change your own account here" });

    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isDeleted = true;
    await user.save();
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
