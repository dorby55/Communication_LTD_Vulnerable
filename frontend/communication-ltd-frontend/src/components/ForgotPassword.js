import React, { useState } from "react";
import { requestPasswordReset, resetPassword } from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await requestPasswordReset(email);
      setSuccess(
        "If an account with that email exists, a reset token has been sent to your email address."
      );
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset token");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword({
        email,
        token,
        newPassword,
      });
      setSuccess(
        "Password reset successful! You can now login with your new password."
      );
      setEmail("");
      setToken("");
      setNewPassword("");
      setConfirmPassword("");
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {step === 1 ? (
        <form onSubmit={handleRequestReset}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit">Request Reset Token</button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label>Reset Token:</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <small>
              Password must be at least 10 characters long and include uppercase
              letters, lowercase letters, numbers, and special characters.
            </small>
          </div>

          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Reset Password</button>
        </form>
      )}

      <div className="login-link">
        Remember your password? <a href="/login">Login here</a>
      </div>
    </div>
  );
}

export default ForgotPassword;
