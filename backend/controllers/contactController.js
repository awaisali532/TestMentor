const Contact = require("../models/Contact");
const sendEmail = require("../utils/sendEmail");

// @desc    Submit Contact Form & Send Email
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // 1. Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    // 2. Save to Database (MongoDB)
    const newContact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    // 3. Prepare Email Content
    const emailMessage = `
      <h2>New Contact Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <br>
      <p><strong>Message:</strong></p>
      <p style="background-color: #f3f4f6; padding: 10px; border-left: 4px solid #3b82f6;">
        ${message}
      </p>
    `;

    // 4. Send Email to Admin (You)
    try {
      await sendEmail({
        to: process.env.EMAIL_USER, // Send to your own email
        subject: `TestMentor Inquiry: ${subject}`,
        html: emailMessage,
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      // We don't stop the request here; we still saved it to DB.
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("Contact Controller Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
