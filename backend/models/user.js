const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Enter name"], maxLength: 30 },
    email: {
      type: String,
      required: [true, "Enter email"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Enter valid email"],
    },
    password: {
      type: String,
      required: [true, "Enter password"],
      minLength: 6,
      select: false,
    },
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
    profilePhoto: { public_id: String, url: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    verifyToken: String,
    verifyTokenExpire: Date,
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

userSchema.methods.getVerifyToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.verifyToken = crypto.createHash("sha256").update(token).digest("hex");
  this.verifyTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

module.exports = mongoose.model("User", userSchema);
