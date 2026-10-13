const crypto = require("crypto");
const User = require("../models/user");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = new User({ name, email, password });
    const token = user.getVerifyToken();
    await user.save();

    const url = `${req.protocol}://${req.get("host")}/api/v1/verify/${token}`;
    console.log("VERIFY LINK:", url);
    try {
      await sendEmail({
        email: user.email,
        subject: "Toy Haven - Verify your email",
        message: `<p>Hi ${user.name}, click to verify your account:</p><a href="${url}">${url}</a>`,
      });
    } catch (e) {
      console.log("Email not sent:", e.message);
    }

    res.status(201).json({
      success: true,
      message: "Registered. Check your email to verify.",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const hashed = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      verifyToken: hashed,
      verifyTokenExpire: { $gt: Date.now() },
    });
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired verification link" });

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpire = undefined;
    await user.save();

    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Enter email and password" });

    const user = await User.findOne({ email, isDeleted: false }).select(
      "+password",
    );
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isVerified)
      return res
        .status(401)
        .json({ message: "Please verify your email first" });
    if (!user.isActive)
      return res.status(403).json({ message: "Account deactivated" });

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(200).json({ success: true, message: "Logged out" });
};

exports.getProfile = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};