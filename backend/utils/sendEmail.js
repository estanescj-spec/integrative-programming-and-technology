const nodemailer = require("nodemailer");

module.exports = async (opts) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `${process.env.SMTP_FROM_NAME || "Toy Haven"} <${process.env.SMTP_FROM_EMAIL}>`,
    to: opts.email,
    subject: opts.subject,
    html: opts.message,
    attachments: opts.attachments,
  });
};
