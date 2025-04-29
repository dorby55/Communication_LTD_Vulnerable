const passwordConfig = require("../config/password-config");
const crypto = require("crypto");

const validatePassword = (password) => {
  const errors = [];

  if (password.length < passwordConfig.minLength) {
    errors.push(
      `Password must be at least ${passwordConfig.minLength} characters long`
    );
  }

  if (passwordConfig.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter");
  }

  if (passwordConfig.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must include at least one lowercase letter");
  }

  if (passwordConfig.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must include at least one number");
  }

  if (
    passwordConfig.requireSpecialChars &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    errors.push("Password must include at least one special character");
  }

  const lowerPassword = password.toLowerCase();
  for (const word of passwordConfig.commonWords) {
    if (lowerPassword.includes(word)) {
      errors.push(`Password cannot contain common words like "${word}"`);
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const generateResetToken = () => {
  const randomBytes = crypto.randomBytes(20).toString("hex");
  return crypto.createHash("sha1").update(randomBytes).digest("hex");
};

module.exports = {
  validatePassword,
  generateResetToken,
};
