const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
dotenv.config({ path: "./config/.env" });

const app = require("./app");
const connectDatabase = require("./config/database");

const User = require("./models/user");
const seedProducts = require("./utils/seed");

const ensureAdmin = async () => {
  const exists = await User.findOne({ role: "admin", isDeleted: false });
  if (!exists) {
    await User.create({
      name: "Admin",
      email: "admin@toyhaven.com",
      password: "admin123",
      role: "admin",
      isVerified: true,
    });
    console.log("Default admin created: admin@toyhaven.com / admin123");
  }
};

connectDatabase().then(async () => {
  await ensureAdmin();
  await seedProducts(); // uncomment if your seed function should run on startup
  app.listen(process.env.PORT, () =>
    console.log(`Server on port ${process.env.PORT} (${process.env.NODE_ENV})`),
  );
});
