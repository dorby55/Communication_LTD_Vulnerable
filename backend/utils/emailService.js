const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
});

const sendPasswordResetEmail = async (email, token) => {
  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      '"Communication LTD" <cyber.course.hit@gmail.com>',
    to: email,
    subject: "Password Reset Request",
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your Communication_LTD account.</p>
      <p>Your reset token is: <strong>${token}</strong></p>
      <p>Please use this token to reset your password. The token will expire in 1 hour.</p>
      <p>If you did not request this reset, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
};
