const PDFDocument = require("pdfkit");
const { orderTotal, peso } = require("./pricing");

const buildReceiptPdf = (order, user) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const total = orderTotal(order);

    doc.fillColor("#0F172A").fontSize(22).text("Toy Haven", { continued: false });
    doc.fontSize(11).fillColor("#64748B").text("Official Order Receipt");
    doc.moveDown();
    doc.fillColor("#0F172A").fontSize(12);
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Customer: ${user?.name || ""} (${user?.email || ""})`);
    doc.text(`Status: ${order.status}`);
    doc.text(`Payment: ${order.paymentMethod}`);
    doc.moveDown();
    doc.text("Ship to:");
    const s = order.shippingInfo || {};
    doc.fontSize(11).fillColor("#334155");
    doc.text(`${s.address}, ${s.city}, ${s.postalCode}, ${s.country}`);
    doc.text(`Phone: ${s.phoneNo}`);
    doc.moveDown();

    doc.fillColor("#0F172A").fontSize(12).text("Items", { underline: true });
    doc.moveDown(0.5);

    order.items.forEach((item) => {
      const sub = item.unitPrice * item.quantity;
      doc
        .fontSize(11)
        .fillColor("#0F172A")
        .text(`${item.name} (${item.variant})`, { continued: true })
        .fillColor("#64748B")
        .text(`  x${item.quantity}  ${peso(item.unitPrice)}  = ${peso(sub)}`);
    });

    doc.moveDown();
    doc.fontSize(14).fillColor("#2563EB").text(`Grand Total: ${peso(total)}`);
    doc.moveDown(2);
    doc.fontSize(9).fillColor("#94A3B8").text("Thank you for shopping at Toy Haven.");
    doc.end();
  });

const orderEmailHtml = (order, user) => {
  const { peso, orderTotal } = require("./pricing");
  const rows = order.items
    .map((item) => {
      const sub = item.unitPrice * item.quantity;
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${item.name} (${item.variant})</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${peso(item.unitPrice)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${peso(sub)}</td>
      </tr>`;
    })
    .join("");
  const total = orderTotal(order);
  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#0F172A">
      <h2>Toy Haven — Order Update</h2>
      <p>Hi ${user?.name || "there"}, your order <strong>${order._id}</strong> is now <strong>${order.status}</strong>.</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <thead>
          <tr style="background:#EFF6FF">
            <th style="text-align:left;padding:8px">Product</th>
            <th style="text-align:left;padding:8px">Qty</th>
            <th style="text-align:left;padding:8px">Unit</th>
            <th style="text-align:left;padding:8px">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-size:16px"><strong>Grand Total: ${peso(total)}</strong></p>
      <p>A PDF receipt is attached.</p>
    </div>`;
};

module.exports = { buildReceiptPdf, orderEmailHtml };
