const discountedPrice = (variant) => {
  const discount = variant.discountPercent || 0;
  return Math.round(variant.price * (1 - discount / 100) * 100) / 100;
};

const orderTotal = (order) =>
  order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

const peso = (n) =>
  `₱${Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;

module.exports = { discountedPrice, orderTotal, peso };
