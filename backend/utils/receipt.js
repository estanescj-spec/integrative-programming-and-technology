const path = require("path");
const PDFDocument = require("pdfkit");
const { orderTotal, peso } = require("./pricing");
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const manila = (d) =>
  new Date(d).toLocaleString("en-PH", { timeZone: "Asia/Manila" });

const buildReceiptPdf = (order, user) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.registerFont(
      "Body",
      path.join(__dirname, "..", "assets", "fonts", "DejaVuSans.ttf"),
    );
    doc.font("Body");
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const total = orderTotal(order);
    const s = order.shippingInfo || {};

    // --- HEADER ---
    doc
      .fillColor("#0F172A")
      .fontSize(22)
      .font("Body")
      .text("Toy Haven", { continued: false });

    doc.fontSize(10).fillColor("#64748B").text("OFFICIAL ORDER RECEIPT");

    doc.moveDown(1);

    // --- META & SHIPPING BOX ---
    const startY = doc.y;
    doc.roundedRect(40, startY, 515, 75, 4).fillAndStroke("#F8FAFC", "#E2E8F0");

    doc.fillColor("#0F172A").fontSize(10);

    // Left Column (Order Info)
    doc
      .text(`Order ID:`, 55, startY + 12, { continued: true })
      .fillColor("#334155")
      .text(` ${order._id}`);

    doc
      .fillColor("#0F172A")
      .text(`Date:`, 55, startY + 28, { continued: true })
      .fillColor("#334155")
      .text(` ${manila(order.createdAt)}`);

    doc
      .fillColor("#0F172A")
      .text(`Payment:`, 55, startY + 44, { continued: true })
      .fillColor("#334155")
      .text(` ${order.paymentMethod || "N/A"}`);

    // Right Column (Shipping Info)
    doc
      .fillColor("#0F172A")
      .text(`Ship To:`, 310, startY + 12, { continued: true })
      .fillColor("#334155")
      .text(` ${s.address || "N/A"}`);

    doc
      .fillColor("#0F172A")
      .text(`Phone:`, 310, startY + 28, { continued: true })
      .fillColor("#334155")
      .text(` ${s.phoneNo || "N/A"}`);

    doc
      .fillColor("#0F172A")
      .text(`Customer:`, 310, startY + 44, { continued: true })
      .fillColor("#334155")
      .text(` ${user?.name || "N/A"} (${user?.email || ""})`);

    doc.y = startY + 95;
    doc.moveDown(0.5);

    // --- ITEMS TABLE HEADER ---
    const tableTop = doc.y;
    doc.rect(40, tableTop, 515, 22).fill("#F1F5F9");

    doc.fillColor("#475569").fontSize(9);
    doc.text("Product", 50, tableTop + 6, { width: 230, continued: false });
    doc.text("Qty", 290, tableTop + 6, { width: 40, align: "center" });
    doc.text("Unit Price", 345, tableTop + 6, { width: 90, align: "right" });
    doc.text("Subtotal", 450, tableTop + 6, { width: 95, align: "right" });

    doc.y = tableTop + 26;

    // --- ITEMS TABLE ROWS ---
    order.items.forEach((item, index) => {
      const label = `${item.name} (${item.variant})`;
      doc.fontSize(10);
      const h = Math.max(doc.heightOfString(label, { width: 230 }), 14) + 8;
      if (doc.y + h > doc.page.height - 100) {
        doc.addPage();
        doc.y = 40;
      }
      const rowY = doc.y;
      if (index % 2 === 1) doc.rect(40, rowY - 3, 515, h).fill("#FAFAFA");
      doc.fillColor("#0F172A").text(label, 50, rowY, { width: 230 });
      doc.fillColor("#334155");
      doc.text(`${item.quantity}`, 290, rowY, { width: 40, align: "center" });
      doc.text(peso(item.unitPrice), 345, rowY, { width: 90, align: "right" });
      doc.text(peso(item.unitPrice * item.quantity), 450, rowY, {
        width: 95,
        align: "right",
      });
      doc.y = rowY + h;
    });

    // --- GRAND TOTAL ---
    if (doc.y + 120 > doc.page.height - 60) doc.addPage();
    const totalY = doc.y + 5;
    doc.moveTo(40, totalY).lineTo(555, totalY).stroke("#E2E8F0");
    const y = totalY + 12;
    doc
      .fillColor("#0F172A")
      .fontSize(11)
      .text("Grand Total:", 300, y + 2, {
        width: 135,
        align: "right",
        lineBreak: false,
      });
    doc
      .fillColor("#2563EB")
      .fontSize(13)
      .text(peso(total), 440, y, {
        width: 105,
        align: "right",
        lineBreak: false,
      });
    doc.y = y + 30;

    // --- FOOTER ---
    doc.moveDown(4);
    doc
      .fontSize(9)
      .fillColor("#94A3B8")
      .text("Thank you for shopping at Toy Haven.", 40, doc.y, {
        align: "center",
      });

    doc.end();
  });

const orderEmailHtml = (order, user) => {
  const rows = order.items
    .map((item) => {
      const sub = item.unitPrice * item.quantity;

      return `<tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #1E293B;">
        ${esc(item.name)} <span style="color: #64748B; font-size: 13px;">(${esc(item.variant)})</span>
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #1E293B; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #1E293B; text-align: right;">${peso(item.unitPrice)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-weight: 500; text-align: right;">${peso(sub)}</td>
    </tr>`;
    })
    .join("");

  const total = orderTotal(order);
  const s = order.shippingInfo || {};

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update — Toy Haven</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 32px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                
                <!-- HEADER -->
                <tr>
                  <td style="background-color: #0F172A; padding: 24px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Toy Haven</h1>
                        </td>
                        <td align="right" style="color: #94A3B8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                          Order Update
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CONTENT -->
                <tr>
                  <td style="padding: 32px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: #1E293B;">
                      Hi <strong>${esc(user?.name || "Valued Customer")}</strong>,
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.5; color: #334155;">
                      Your order <code style="background-color: #F1F5F9; padding: 2px 6px; border-radius: 4px; font-size: 14px; color: #0F172A;">${order._id}</code> has been updated and is currently <strong style="color: #2563EB; text-transform: capitalize;">${esc(order.status)}</strong>.
                    </p>

                    <!-- ORDER & SHIPPING META BOX -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border-radius: 6px; padding: 16px; margin-bottom: 24px; border: 1px solid #E2E8F0;">
                      <tr>
                        <td width="50%" valign="top" style="font-size: 14px; color: #475569; line-height: 1.6;">
                          <strong style="color: #0F172A; display: block; margin-bottom: 4px;">Payment Method</strong>
                          ${order.paymentMethod || "N/A"}
                        </td>
                        <td width="50%" valign="top" style="font-size: 14px; color: #475569; line-height: 1.6;">
                          <strong style="color: #0F172A; display: block; margin-bottom: 4px;">Shipping Address</strong>
                          ${esc(s.address || "N/A")}<br>
                          <span style="color: #64748B; font-size: 13px;">Phone: ${esc(s.phoneNo || "N/A")}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- ITEMS TABLE -->
                    <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #0F172A; font-weight: 600;">Order Summary</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
                      <thead>
                        <tr style="background-color: #F1F5F9;">
                          <th style="text-align: left; padding: 10px 12px; color: #475569; font-weight: 600; border-top-left-radius: 4px; border-bottom-left-radius: 4px;">Product</th>
                          <th style="text-align: center; padding: 10px 12px; color: #475569; font-weight: 600;">Qty</th>
                          <th style="text-align: right; padding: 10px 12px; color: #475569; font-weight: 600;">Unit Price</th>
                          <th style="text-align: right; padding: 10px 12px; color: #475569; font-weight: 600; border-top-right-radius: 4px; border-bottom-right-radius: 4px;">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rows}
                      </tbody>
                    </table>

                    <!-- TOTAL -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #E2E8F0; padding-top: 16px; margin-bottom: 24px;">
                      <tr>
                        <td style="font-size: 16px; color: #0F172A; font-weight: 600;">Grand Total</td>
                        <td align="right" style="font-size: 18px; color: #2563EB; font-weight: 700;">${peso(total)}</td>
                      </tr>
                    </table>

                    <!-- ATTACHMENT NOTICE -->
                    <p style="margin: 0; font-size: 13px; color: #64748B; background-color: #EFF6FF; border-left: 3px solid #2563EB; padding: 10px 12px; border-radius: 0 4px 4px 0;">
                      An official copy of your receipt has been attached as a PDF to this email for your records.
                    </p>

                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color: #F8FAFC; padding: 20px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #64748B;">Thank you for shopping at Toy Haven!</p>
                    <p style="margin: 0; font-size: 11px; color: #94A3B8;">If you have any questions, feel free to reply directly to this email.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;
};

module.exports = { buildReceiptPdf, orderEmailHtml };
