const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const auth = require("./routes/auth");
const product = require("./routes/product");
const category = require("./routes/category");
const cart = require("./routes/cart");
const order = require("./routes/order");
const review = require("./routes/review");
const admin = require("./routes/admin");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/v1/health", (req, res) => res.json({ ok: true }));

app.use("/api/v1", auth);
app.use("/api/v1", product);
app.use("/api/v1", category);
app.use("/api/v1", cart);
app.use("/api/v1", order);
app.use("/api/v1", review);
app.use("/api/v1", admin);

module.exports = app;
