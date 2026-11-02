const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const dotenv = require("dotenv");
dotenv.config({ path: "./config/.env" });
const app = require("./app");
const connectDatabase = require("./config/database");
const User = require("./models/user");
const seedProducts = require("./utils/seed");
const ensureAdmin = async () => {
  if (!process.env.ADMIN_PASSWORD) return;
  const exists = await User.findOne({ role: "admin", isDeleted: false });
  if (!exists) {
    await User.create({
      name: "Admin",
      email: process.env.ADMIN_EMAIL || "admin@toyhaven.com",
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
      isVerified: true,
    });
    console.log("Default admin created");
  }
};

connectDatabase().then(async () => {
  await ensureAdmin();
  try {
    await seedProducts();
  } catch (e) {
    console.error("Seeding skipped:", e.message);
  }
  app.listen(process.env.PORT, () =>
    console.log(`Server on port ${process.env.PORT} (${process.env.NODE_ENV})`),
  );
});
