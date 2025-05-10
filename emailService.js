const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Change this if using a different email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your app password
  },
});

// Verify the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error verifying transporter:", error);
  } else {
    console.log("Transporter verified successfully");
  }
});

/**
 * Sends an email using the configured transporter.
 * @param {string} recipient - The recipient's email address.
 * @param {string} subject - The email subject.
 * @param {string} body - The body of the email (can be plain text or HTML).
 * @param {boolean} [isHtml=false] - Whether the body is HTML.
 * @returns {Promise<void>}
 */
const sendEmail = async (recipient, subject, body, isHtml = false) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: subject,
      [isHtml ? 'html' : 'text']: body,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipient}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Export transporter as the default export and sendEmail as a named export
module.exports = transporter;
module.exports.sendEmail = sendEmail;