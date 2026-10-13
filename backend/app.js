const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const auth = require("./routes/auth");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/v1/health", (req, res) => res.json({ ok: true }));

app.use("/api/v1", auth);

module.exports = app;
