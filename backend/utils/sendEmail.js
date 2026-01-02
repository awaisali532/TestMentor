const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create the Transporter (Configuration same rahegi)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define Email Options
  // Yahan humne check lagaya hai ke agar 'options.from' aya hai to wo use karo, warna default
  const senderName = options.from || "TestMentor Support";

  const mailOptions = {
    from: `"${senderName}" <${process.env.EMAIL_USER}>`, // Dynamic Sender Name
    to: options.to, // Receiver (User ka email)
    subject: options.subject,
    html: options.html, // HTML Body (OTP Template)
  };

  // 3. Send the Email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
