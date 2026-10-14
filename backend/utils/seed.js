const Product = require("../models/product");

const seeds = [
  {
    name: "LEGO Starship Commander",
    description: "Build a command starship with 1,248 pieces and a display stand.",
    category: "Lego Sets",
    photos: [
      {
        public_id: "seed-lego",
        url: "https://images.unsplash.com/photo-1587654780291-39c940431d6c?auto=format&fit=crop&w=800&q=80",
      },
    ],
    variants: [
      { label: "Standard", price: 4990, discountPercent: 0, stock: 20 },
      { label: "Collector Box", price: 6290, discountPercent: 10, stock: 8 },
    ],
  },
  {
    name: "RC Monster Truck Pro",
    description: "All-terrain remote control truck with rechargeable battery.",
    category: "RC Cars",
    photos: [
      {
        public_id: "seed-rc",
        url: "https://images.unsplash.com/photo-1594787318286-3d835c1d2077?auto=format&fit=crop&w=800&q=80",
      },
    ],
    variants: [{ label: "Blue", price: 2890, discountPercent: 5, stock: 15 }],
  },
  {
    name: "Hot Wheels Ultimate Track",
    description: "Loop-and-launch track set with two exclusive die-cast cars.",
    category: "Hot Wheels",
    photos: [
      {
        public_id: "seed-hw",
        url: "https://images.unsplash.com/photo-1532330393533-443990a51d7c?auto=format&fit=crop&w=800&q=80",
      },
    ],
    variants: [{ label: "Track Set", price: 1890, discountPercent: 0, stock: 25 }],
  },
  {
    name: "Nerf Elite Blaster",
    description: "Pump-action blaster with 12-dart clip and tactical rails.",
    category: "Nerf Blasters",
    photos: [
      {
        public_id: "seed-nerf",
        url: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=800&q=80",
      },
    ],
    variants: [{ label: "Elite", price: 1590, discountPercent: 0, stock: 18 }],
  },
  {
    name: "Wooden Railway Puzzle Town",
    description: "48-piece wooden puzzle that builds a miniature railway town.",
    category: "Puzzles",
    photos: [
      {
        public_id: "seed-puzzle",
        url: "https://images.unsplash.com/photo-1587654780291-39c940431d6c?auto=format&fit=crop&w=800&q=80",
      },
    ],
    variants: [{ label: "48 pcs", price: 890, discountPercent: 0, stock: 30 }],
  },
  {
    name: "Cloud Buddy Plush",
    description: "Super-soft plush companion for nap time and travel.",
    category: "Plush Toys",
    photos: [
      {
        public_id: "seed-plush",
        url: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80",
      },
    ],
    variants: [
      { label: "Small", price: 690, discountPercent: 0, stock: 40 },
      { label: "Large", price: 1190, discountPercent: 0, stock: 12 },
    ],
  },
];

module.exports = async function seedProducts() {
  const count = await Product.countDocuments({ isDeleted: false });
  if (count > 0) return;
  await Product.insertMany(seeds);
  console.log("Seeded sample products");
};
