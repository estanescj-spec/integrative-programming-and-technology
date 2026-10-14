export const peso = (n) =>
  `₱${Number(n || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;

export const discountedPrice = (variant) => {
  if (!variant) return 0;
  return Math.round(variant.price * (1 - (variant.discountPercent || 0) / 100) * 100) / 100;
};

export const lowestPrice = (product) => {
  if (!product?.variants?.length) return 0;
  return Math.min(...product.variants.map(discountedPrice));
};

export const orderTotal = (order) =>
  (order?.items || []).reduce((s, i) => s + i.unitPrice * i.quantity, 0);

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const filesToDataUrls = (fileList) =>
  Promise.all(Array.from(fileList || []).map(fileToDataUrl));

export const stars = (rating) => {
  const r = Math.round(Number(rating) || 0);
  return "★".repeat(r) + "☆".repeat(5 - r);
};
