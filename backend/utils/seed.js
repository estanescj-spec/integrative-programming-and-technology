const Product = require("../models/product");
const User = require("../models/user");
const Category = require("../models/category");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Review = require("../models/review");
const { discountedPrice } = require("./pricing");

const categorySeeds = [
  {
    name: "Lego Sets",
    description: "Building sets for every age and skill level.",
  },
  { name: "Hot Wheels", description: "Die-cast cars, tracks, and playsets." },
  { name: "Nerf Blasters", description: "Foam dart blasters and accessories." },
  { name: "Puzzles", description: "Jigsaw and wooden puzzles for all ages." },
];

const userSeeds = [
  { name: "Maria Santos", email: "maria@toyhaven.com" },
  { name: "Juan Dela Cruz", email: "juan@toyhaven.com" },
  { name: "Ana Reyes", email: "ana@toyhaven.com" },
];

const daysAgo = (n) => new Date(Date.now() - n * 86400000);

const shippingInfo = {
  address: "123 Rizal Street",
  city: "Parañaque",
  phoneNo: "09171234567",
  postalCode: "1700",
  country: "Philippines",
};

const line = (p, vi, quantity) => {
  const v = p.variants[vi % p.variants.length];
  return {
    product: p._id,
    variant: v.label,
    name: p.name,
    unitPrice: discountedPrice(v),
    quantity,
  };
};

async function seedUsers() {
  for (const u of userSeeds) {
    if (await User.findOne({ email: u.email })) continue;
    await User.create({
      ...u,
      password: "password123",
      role: "customer",
      isVerified: true,
    });
  }
}

async function seedCategories() {
  if ((await Category.countDocuments()) > 0) return;
  await Category.insertMany(categorySeeds);
}

async function seedOrders(customers, products) {
  if (
    (await Order.countDocuments()) > 0 ||
    customers.length < 3 ||
    products.length < 4
  )
    return;
  const P = (i) => products[i % products.length];
  const U = (i) => customers[i % customers.length]._id;

  const specs = [
    // delivered orders spread over the last 30 days (feeds the dashboard chart)
    {
      u: 0,
      ago: 28,
      status: "delivered",
      pay: "GCash",
      lines: [line(P(0), 0, 1), line(P(2), 0, 2)],
    },
    {
      u: 1,
      ago: 24,
      status: "delivered",
      pay: "Cash on Delivery",
      lines: [line(P(1), 0, 1)],
    },
    {
      u: 2,
      ago: 20,
      status: "delivered",
      pay: "Credit Card",
      lines: [line(P(3), 0, 2), line(P(4), 0, 1)],
    },
    {
      u: 0,
      ago: 16,
      status: "delivered",
      pay: "GCash",
      lines: [line(P(5), 1, 1)],
    },
    {
      u: 1,
      ago: 12,
      status: "delivered",
      pay: "Cash on Delivery",
      lines: [line(P(0), 1, 1), line(P(3), 0, 1)],
    },
    {
      u: 2,
      ago: 8,
      status: "delivered",
      pay: "GCash",
      lines: [line(P(2), 0, 3)],
    },
    {
      u: 0,
      ago: 5,
      status: "delivered",
      pay: "Credit Card",
      lines: [line(P(4), 0, 2)],
    },
    {
      u: 1,
      ago: 3,
      status: "delivered",
      pay: "GCash",
      lines: [line(P(1), 0, 1)],
      returnRequest: {
        reason: "Item stopped working after one day",
        status: "requested",
        requestedAt: daysAgo(1),
      },
    },
    // other statuses
    {
      u: 2,
      ago: 0,
      status: "pending",
      pay: "Cash on Delivery",
      lines: [line(P(5), 0, 2)],
    },
    {
      u: 0,
      ago: 1,
      status: "processing",
      pay: "GCash",
      lines: [line(P(0), 0, 1)],
    },
    {
      u: 1,
      ago: 2,
      status: "shipped",
      pay: "Credit Card",
      lines: [line(P(2), 0, 1), line(P(3), 0, 1)],
    },
    {
      u: 2,
      ago: 6,
      status: "cancelled",
      pay: "Cash on Delivery",
      lines: [line(P(1), 0, 1)],
    },
    {
      u: 0,
      ago: 10,
      status: "returned",
      pay: "GCash",
      lines: [line(P(4), 0, 1)],
      returnRequest: {
        reason: "Item arrived damaged",
        status: "approved",
        requestedAt: daysAgo(9),
      },
    },
  ];

  for (const s of specs) {
    await Order.create({
      user: U(s.u),
      items: s.lines,
      shippingInfo,
      status: s.status,
      paymentMethod: s.pay,
      returnRequest: s.returnRequest,
      createdAt: daysAgo(s.ago),
    });
  }
}

async function seedCarts(customers, products) {
  if (
    (await Cart.countDocuments()) > 0 ||
    customers.length < 2 ||
    products.length < 3
  )
    return;
  await Cart.create([
    {
      user: customers[0]._id,
      items: [
        {
          product: products[0]._id,
          variant: products[0].variants[0].label,
          quantity: 1,
        },
        {
          product: products[2]._id,
          variant: products[2].variants[0].label,
          quantity: 2,
        },
      ],
    },
    {
      user: customers[1]._id,
      items: [
        {
          product: products[3]._id,
          variant: products[3].variants[0].label,
          quantity: 1,
        },
      ],
    },
  ]);
}

async function seedReviews() {
  if ((await Review.countDocuments()) > 0) return;
  const delivered = await Order.find({ status: "delivered" });
  const ratings = [5, 4, 5, 3, 4, 5, 2, 4];
  const comments = [
    "Amazing quality, my kid loves it!",
    "Good value for the price.",
    "Fast delivery and well packed.",
    "Decent, but the box was a bit dented.",
    "Exactly as described. Would buy again.",
    "Great gift idea, highly recommended.",
    "Stopped working after a day.",
    "Fun and sturdy, worth it.",
  ];
  const seen = new Set();
  let i = 0;
  for (const order of delivered) {
    for (const item of order.items) {
      const key = `${order.user}-${item.product}`;
      if (seen.has(key)) continue;
      seen.add(key);
      await Review.create({
        user: order.user,
        product: item.product,
        order: order._id,
        rating: ratings[i % ratings.length],
        comment: comments[i % comments.length],
      });
      i++;
    }
  }
  // keep each product's rating summary in sync
  const stats = await Review.aggregate([
    { $group: { _id: "$product", avg: { $avg: "$rating" }, n: { $sum: 1 } } },
  ]);
  for (const s of stats) {
    await Product.findByIdAndUpdate(s._id, {
      ratings: Math.round(s.avg * 10) / 10,
      numOfReviews: s.n,
    });
  }
}

module.exports = async function seedProducts() {
  await seedCategories();

  if ((await Product.countDocuments({ isDeleted: false })) === 0) {
    await Product.insertMany(seeds);
    console.log("Seeded sample products");
  }

  await seedUsers();
  const customers = await User.find({
    email: { $in: userSeeds.map((u) => u.email) },
  });
  const products = await Product.find({ isDeleted: false })
    .sort({ createdAt: 1 })
    .limit(6);

  await seedOrders(customers, products);
  await seedCarts(customers, products);
  await seedReviews();
  console.log("Seed check complete");
};
