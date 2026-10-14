const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (dataUri, folder = "toyhaven") => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return { public_id: `local-${Date.now()}`, url: dataUri };
  }
  const result = await cloudinary.uploader.upload(dataUri, { folder });
  return { public_id: result.public_id, url: result.secure_url };
};

const destroyImage = async (publicId) => {
  if (!publicId || publicId.startsWith("local-") || !process.env.CLOUDINARY_CLOUD_NAME)
    return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.log("Cloudinary destroy failed:", err.message);
  }
};

module.exports = { uploadImage, destroyImage };
