const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {
  validatePassword,
  generateResetToken,
} = require("../utils/passwordUtils");
const { sendPasswordResetEmail } = require("../utils/emailService");
const passwordConfig = require("../config/password-config");

exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "Email already in use", data: existingEmail });
    }

    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Password requirements not met", errors });
    }

    await User.create(username, password, email);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({
      sqlMessage: err.sqlMessage || null,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findByUsernameAndPassword(username, password);
    if (!user) {
      const userByUsername = await User.findByUsername(username);
      if (userByUsername) {
        await User.incrementLoginAttempts(userByUsername.user_id);
      }
      if (
        userByUsername.failed_login_attempts >= passwordConfig.maxLoginAttempts
      ) {
        return res.status(401).json({
          message:
            "Account locked due to too many failed login attempts. Please reset your password.",
        });
      }
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.failed_login_attempts >= passwordConfig.maxLoginAttempts) {
      return res.status(401).json({
        message:
          "Account locked due to too many failed login attempts. Please reset your password.",
      });
    }

    await User.resetLoginAttempts(user.user_id);

    const payload = {
      user: {
        id: user.user_id,
        username: user.username,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByUsername(req.user.username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = currentPassword === user.password;
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const { isValid, errors } = validatePassword(newPassword);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Password requirements not met", errors });
    }

    const isInHistory = await User.isPasswordInHistory(userId, newPassword);
    if (isInHistory) {
      return res.status(400).json({ message: "Cannot reuse recent passwords" });
    }

    await User.updatePassword(userId, newPassword);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.json({
        message:
          "If your email exists in our system, you will receive a reset token shortly",
      });
    }

    const resetToken = generateResetToken();

    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 2);

    await User.updateResetToken(user.user_id, resetToken, tokenExpiry);

    await sendPasswordResetEmail(email, resetToken);

    res.json({
      message:
        "If your email exists in our system, you will receive a reset token shortly",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    const user = await User.findByResetToken(token);

    if (!user || user.email !== email) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const { isValid, errors } = validatePassword(newPassword);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Password requirements not met", errors });
    }

    const isInHistory = await User.isPasswordInHistory(
      user.user_id,
      newPassword
    );
    if (isInHistory) {
      return res.status(400).json({ message: "Cannot reuse recent passwords" });
    }

    await User.updatePassword(user.user_id, newPassword);

    await User.updateResetToken(user.user_id, null, null);

    await User.resetLoginAttempts(user.user_id);

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
