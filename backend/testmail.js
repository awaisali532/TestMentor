// testMail.js
require("dotenv").config();
const sendEmail = require("./utils/sendEmail");

sendEmail(
  "awaisalibscs080@gmail.com", // ✅ your own email
  "Test Email from Brevo",
  "<h1>This is a test email</h1>"
)
  .then(() => console.log("✅ Email sent"))
  .catch((err) => console.log("❌ Email error:", err));
