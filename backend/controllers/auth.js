const crypto = require("crypto");
const User = require("../models/user");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const { uploadImage, destroyImage } = require("../utils/cloudinary");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const firebaseAuth = () => {
  if (!getApps().length) {
    initializeApp({
      credential: cert(
        process.env.FIREBASE_SERVICE_ACCOUNT
          ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
          : require("../config/serviceAccountKey.json"),
      ),
    });
  }
  return getAuth();
};

exports.googleLogin = async (req, res) => {
  try {
    const decoded = await firebaseAuth().verifyIdToken(req.body.idToken);
    if (!decoded.email_verified)
      return res.status(403).json({ message: "Google email not verified" });

    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      user = await User.create({
        name: decoded.name || decoded.email.split("@")[0],
        email: decoded.email,
        password: crypto.randomBytes(16).toString("hex"),
        isVerified: true,
        profilePhoto: { url: decoded.picture },
      });
    }
    if (user.isDeleted || !user.isActive)
      return res.status(403).json({ message: "Account unavailable" });
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }
    sendToken(user, 200, res);
  } catch (err) {
    res.status(401).json({ message: "Google login failed" });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });
    const user = new User({ name, email, password });
    const token = user.getVerifyToken();
    await user.save();

    const url = `${process.env.CLIENT_URL}/api/v1/verify/${token}`;
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
      return res.redirect(`${process.env.CLIENT_URL}/login?verified=false`);
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpire = undefined;
    await user.save();
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      isDeleted: false,
    });
    if (user && !user.isVerified) {
      const token = user.getVerifyToken();
      await user.save();
      const url = `${process.env.CLIENT_URL}/api/v1/verify/${token}`;
      try {
        await sendEmail({
          email: user.email,
          subject: "Toy Haven - Verify your email",
          message: `<a href="${url}">${url}</a>`,
        });
      } catch (e) {
        console.log("Email not sent:", e.message);
      }
    }
    res.json({
      success: true,
      message: "If the account exists, a new link was sent.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Enter email and password" });
    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
      isDeleted: false,
    }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });
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

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const { name, email, password, photo, currentPassword } = req.body;
    const newEmail = email?.trim().toLowerCase();
    const emailChanged = newEmail && newEmail !== user.email;
    if (
      (emailChanged || password) &&
      !(await user.comparePassword(currentPassword || ""))
    )
      return res.status(400).json({ message: "Current password is incorrect" });
    if (
      emailChanged &&
      (await User.findOne({ email: newEmail, _id: { $ne: user._id } }))
    )
      return res.status(400).json({ message: "Email already in use" });
    if (name) user.name = name;
    if (emailChanged) user.email = newEmail;
    if (password) user.password = password;
    if (photo) {
      const old = user.profilePhoto?.public_id;
      user.profilePhoto = await uploadImage(photo, "toyhaven/avatars");
      if (old) await destroyImage(old);
    }
    await user.save();
    user.password = undefined;
    res.json({ success: true, user });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Email already in use" });
    res.status(400).json({ message: err.message });
  }
};
