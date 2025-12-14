const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create the Transporter (The configuration)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define Email Options
  const mailOptions = {
    from: `TestMentor Contact <${process.env.EMAIL_USER}>`, // Sender Name
    to: options.to, // Receiver (You)
    subject: options.subject,
    html: options.html, // HTML Body
  };

  // 3. Send the Email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
