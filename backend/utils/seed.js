const path = require("path");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const Product = require("../models/product");
const User = require("../models/user");
const Category = require("../models/category");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Review = require("../models/review");
const { discountedPrice } = require("./pricing");

const uploadImages = (files = []) =>
  Promise.all(
    files.map(async (f) => {
      const r = await cloudinary.uploader.upload(
        path.join(__dirname, "..", "..", "frontend", "public", f),
        {
          public_id: path.parse(f).name,
          overwrite: true,
        },
      );
      return { public_id: r.public_id, url: r.secure_url };
    }),
  );

const categorySeeds = [
  { name: "LEGO", description: "Building sets for every age and skill level." },
  { name: "Hot Wheels", description: "Die-cast cars, tracks, and playsets." },
  { name: "Puzzle", description: "Puzzles, cards, and classic games." },
  { name: "Nerf", description: "Foam dart blasters and accessories." },
];

// random discount per variant, picked each time the seeder runs
const rd = () => Math.random() < 0.7 ? 0 : [5, 10, 15, 20][Math.floor(Math.random() * 4)];
const photoByLabel = {
  "LEGO® City 60463 Ladder Fire Engine": 0,
  "LEGO® City Race Car and Car Carrier Truck 60406": 2,
  "LEGO® City Space Explorer Rover and Alien Life toy playset 60431": 3,
  "LEGO® Creator 31160 3in1 Aircraft Race Plane": 0,
  "LEGO® Creator 31164 3in1 Space Robot": 2,
  "LEGO® Speed Champions Aston Martin Aramco F1® AMR24 Race Car 77245": 0,
  "LEGO® Speed Champions BWT Alpine F1® Team A524 Race Car 77248": 2,
  "LEGO® Speed Champions Ferrari SF-24 F1® Race Car 77242": 4,
  Blue: 0,
  Red: 1,
  "NISSAN 300 ZX GTS": 1,
  "TOYOTA OFF-ROAD TRUCK": 2,
  "'89 TOYOTA SUPRA": 3,
  "TRIBAL DOMINATION": 1,
  "TIC-TAC TOWED": 2,
  "GARGOYLE GUARDIAN": 3,
  "SOLDIER GRIND": 4,
};

const v = (label, price, stock) => ({ label, price, stock, photoIndex: photoByLabel[label], discountPercent: rd(), });

const seeds = [
  // ---- LEGO ----
  {
    name: "LEGO® City",
    description: "City playsets: fire engine, race car carrier, and space rover.",
    categories: ["LEGO"],
    variants: [
      v("LEGO® City 60463 Ladder Fire Engine", 1799, 20),
      v("LEGO® City Race Car and Car Carrier Truck 60406", 3299, 15),
      v("LEGO® City Space Explorer Rover and Alien Life toy playset 60431", 1299, 25,),
    ],
    images: ["LadderFireEngine1.png", "LadderFireEngine2.png", "RaceCarandCarCarrierTruck.png", "SpaceExplorerRoverandAlienLife.png",],
  },
  {
    name: "LEGO® Creator",
    description: "3in1 Creator sets: rebuild into a race plane, jet, or helicopter, or a space robot, spaceship, or astronaut.",
    categories: ["LEGO"],
    variants: [
      v("LEGO® Creator 31160 3in1 Aircraft Race Plane", 999, 30),
      v("LEGO® Creator 31164 3in1 Space Robot", 899, 30),
    ],
    images: ["AircraftRacePlane1.png", "AircraftRacePlane2.png", "SpaceRobot1.png", "SpaceRobot2.png",],
  },
  {
    name: "LEGO® Daffodils 40747",
    description: "Buildable daffodil bouquet for display.",
    categories: ["LEGO"],
    variants: [v("Standard", 799, 40)],
    images: ["Daffodils1.png", "Daffodils2.png"],
  },
  {
    name: "LEGO® NINJAGO® 71828 Lloyd's Pull-Back Race Car",
    description: "Pull-back race car with Lloyd minifigure.",
    categories: ["LEGO"],
    variants: [v("Standard", 599, 35)],
    images: ["Ninjago.png"],
  },
  {
    name: "LEGO® Speed Champions",
    description: "Buildable F1® race cars in Speed Champions scale.",
    categories: ["LEGO"],
    variants: [
      v("LEGO® Speed Champions Aston Martin Aramco F1® AMR24 Race Car 77245", 1199, 20,),
      v("LEGO® Speed Champions BWT Alpine F1® Team A524 Race Car 77248", 1199, 20,),
      v("LEGO® Speed Champions Ferrari SF-24 F1® Race Car 77242", 1199, 20),
    ],
    images: ["Aramco1.png", "Aramco2.png", "BWT1.png", "BWT2.png", "Ferrari1.png", "Ferrari2.png",],
  },
  // ---- Nerf ----
  {
    name: "Nerf Loadout Arctic Zerostiker",
    description: "Arctic-themed foam dart blaster loadout.",
    categories: ["Nerf"],
    variants: [v("Standard", 1499, 20)],
    images: ["ArcticZerostiker1.png", "ArcticZerostiker2.png", "ArcticZerostiker3.png",],
  },
  {
    name: "Nerf Loadout Galactic Commander",
    description: "Space-themed foam dart blaster loadout.",
    categories: ["Nerf"],
    variants: [v("Standard", 1499, 20)],
    images: ["GalacticCommander1.png", "GalacticCommander2.png", "GalacticCommander3.png",],
  },
  {
    name: "Nerf Loadout Cyberlight Ghost",
    description: "Cyber-themed foam dart blaster loadout.",
    categories: ["Nerf"],
    variants: [v("Standard", 1499, 20)],
    images: ["CyberlightGhost1.png", "CyberlightGhost2.png", "CyberlightGhost3.png",],
  },
  // ---- Puzzle ----
  {
    name: "Spin Master Games Rubik's Original 3x3 Cube",
    description: "The classic 3x3 color-matching puzzle cube.",
    categories: ["Puzzle"],
    variants: [v("Standard", 499, 50)],
    images: ["Cube1.png", "Cube2.png"],
  },
  {
    name: "Monopoly The Classic Board Game",
    description:
      "The classic property trading board game for the whole family.",
    categories: ["Puzzle"],
    variants: [v("Standard", 1299, 25)],
    images: ["Monopoly1.png", "Monopoly2.png", "Monopoly3.png", "Monopoly4.png",],
  },
  {
    name: "Bicycle Playing Cards",
    description: "Standard 52-card deck with a classic finish.",
    categories: ["Puzzle"],
    variants: [v("Blue", 249, 60), v("Red", 249, 60)],
    images: ["BlueCards.png", "RedCards.png"],
  },
  // ---- Hot Wheels ----
  {
    name: "Hot Wheels Monster Truck 1:43 Scale Twisted Tredz",
    description: "1:43 scale monster truck with oversized wheels.",
    categories: ["Hot Wheels"],
    variants: [v("Standard", 399, 40)],
    images: ["MonsterTruck.png"],
  },
  {
    name: "Hot Wheels Hotbox - 15 Jaguar F-Type Project 7 and 70 Dodge Charger",
    description: "Two-car Hotbox set with a Jaguar F-Type and a Dodge Charger.",
    categories: ["Hot Wheels"],
    variants: [v("Standard", 699, 30)],
    images: ["Hotbox.png"],
  },
  {
    name: "Hot Wheels® Premium Team Transport",
    description: "Premium die-cast car with matching team transport hauler.",
    categories: ["Hot Wheels"],
    variants: [
      v("NISSAN 300 ZX GTS", 1199, 15),
      v("TOYOTA OFF-ROAD TRUCK", 1199, 15),
      v("'89 TOYOTA SUPRA", 1199, 15),
    ],
    images: ["TeamTransport.png", "Nissan.png", "Toyota.png", "ToyotaSupra.png",],
  },
  {
    name: "Hot Wheels Super Rigs Transporter Vehicle Assorted Styles",
    description: "Transporter rig that carries die-cast cars.",
    categories: ["Hot Wheels"],
    variants: [v("Standard", 899, 25)],
    images: ["TransporterVehicle.png"],
  },
  {
    name: "Hot Wheels Skate Fingerboard Single Pack",
    description: "Collectible fingerboard in assorted designs.",
    categories: ["Hot Wheels"],
    variants: [
      v("TRIBAL DOMINATION", 299, 40),
      v("TIC-TAC TOWED", 299, 40),
      v("GARGOYLE GUARDIAN", 299, 40),
      v("SOLDIER GRIND", 299, 40),
    ],
    images: ["SinglePack.png", "TD.png", "TT.png", "GG.png", "SG.png"],
  },
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
  if ((await Order.countDocuments()) > 0 ||customers.length < 3 ||products.length < 4) return;
  const P = (i) => products[i % products.length];
  const U = (i) => customers[i % customers.length]._id;

  const specs = [
    // delivered orders spread over the last 30 days (feeds the dashboard chart)
    {u: 0, ago: 28, status: "delivered", pay: "GCash", lines: [line(P(0), 0, 1), line(P(2), 0, 2)],},
    {u: 1, ago: 24, status: "delivered", pay: "Cash on Delivery", lines: [line(P(1), 0, 1)],},
    {u: 2, ago: 20, status: "delivered", pay: "Card", lines: [line(P(3), 0, 2), line(P(4), 0, 1)],},
    {u: 0, ago: 16, status: "delivered", pay: "GCash", lines: [line(P(5), 1, 1)],},
    {u: 1, ago: 12, status: "delivered", pay: "Cash on Delivery", lines: [line(P(0), 1, 1), line(P(3), 0, 1)],},
    {u: 2, ago: 8, status: "delivered", pay: "GCash", lines: [line(P(2), 0, 3)],},
    {u: 0, ago: 5, status: "delivered", pay: "Card", lines: [line(P(4), 0, 2)],},
    {u: 1, ago: 3, status: "delivered", pay: "GCash", lines: [line(P(1), 0, 1)],
      returnRequest: { reason: "Item stopped working after one day", status: "requested", requestedAt: daysAgo(1), },},
    {u: 2, ago: 0, status: "pending", pay: "Cash on Delivery", lines: [line(P(5), 0, 2)],},
    {u: 0, ago: 1, status: "processing", pay: "GCash", lines: [line(P(0), 0, 1)],},
    {u: 1, ago: 2, status: "shipped", pay: "Card", lines: [line(P(2), 0, 1), line(P(3), 0, 1)],},
    {u: 2, ago: 6, status: "cancelled", pay: "Cash on Delivery", lines: [line(P(1), 0, 1)],},
    {u: 0, ago: 10, status: "returned", pay: "GCash", lines: [line(P(4), 0, 1)],
      returnRequest: { reason: "Item arrived damaged", status: "approved", requestedAt: daysAgo(9), },},

    ...products.map((_, i) => ({
      u: i % 3,
      ago: 4 + (i % 20),
      status: "delivered",
      pay: "GCash",
      lines: [line(P(i), 0, 1)],
    })),
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
  if ((await Cart.countDocuments()) > 0 || customers.length < 2 || products.length < 3) return;
  await Cart.create([
    {
      user: customers[0]._id,
      items: [
        {product: products[0]._id, variant: products[0].variants[0].label, quantity: 1,},
        {product: products[2]._id, variant: products[2].variants[0].label, quantity: 2,},
      ],
    },
    {
      user: customers[1]._id,
      items: [
        {product: products[3]._id, variant: products[3].variants[0].label, quantity: 1,},
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
  const stats = await Review.aggregate([  { $group: { _id: "$product", avg: { $avg: "$rating" }, n: { $sum: 1 } } },  ]);
  for (const s of stats) {
    await Product.findByIdAndUpdate(s._id, { ratings: Math.round(s.avg * 10) / 10, numOfReviews: s.n, });
  }
}

async function resetAll() {
  await Promise.all([
    Review.deleteMany({}),
    Order.deleteMany({}),
    Cart.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    User.deleteMany({ role: { $ne: "admin" } }),
  ]);
  console.log("Dropped existing seed data");
}

module.exports = async function seedProducts() {
  await seedCategories();

  if ((await Product.countDocuments({ isDeleted: false })) === 0) {
    const withPhotos = await Promise.all(seeds.map(async ({ images, ...s }) => ({ ...s, photos: await uploadImages(images), })),);
    await Product.insertMany(withPhotos);
    console.log("Seeded sample products");
  }

  await seedUsers();
  const customers = await User.find({ email: { $in: userSeeds.map((u) => u.email) }, });
  const products = await Product.find({ isDeleted: false }).sort({ createdAt: 1, });
  await seedOrders(customers, products);
  await seedCarts(customers, products);
  await seedReviews();
  console.log("Seed check complete");
};