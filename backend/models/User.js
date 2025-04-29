// Vulnerable version of models/User.js
const db = require("../config/db");
const crypto = require("crypto");
const passwordConfig = require("../config/password-config");

class User {
  static async create(username, password, email) {
    // Generate a random salt
    const salt = crypto.randomBytes(16).toString("hex");

    // Hash the password with HMAC and salt
    const hmac = crypto.createHmac("sha256", salt);
    hmac.update(password);
    const hashedPassword = hmac.digest("hex");

    // VULNERABLE: Direct string concatenation for SQL Injection
    const query = `
      INSERT INTO users (username, password_hash, email, salt, failed_login_attempts)
      VALUES ('${username}', '${hashedPassword}', '${email}', '${salt}', 0)
    `;

    const [result] = await db.query(query);
    return result.insertId;
  }

  static async findByUsername(username) {
    // VULNERABLE: Direct string concatenation for SQL Injection
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    const [rows] = await db.query(query);
    return rows[0];
  }

  static async findByEmail(email) {
    // VULNERABLE: Direct string concatenation for SQL Injection
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    const [rows] = await db.query(query);
    return rows[0];
  }

  static async updatePassword(userId, newPassword) {
    // Generate a random salt
    const salt = crypto.randomBytes(16).toString("hex");

    // Hash the password with HMAC and salt
    const hmac = crypto.createHmac("sha256", salt);
    hmac.update(newPassword);
    const hashedPassword = hmac.digest("hex");

    // Get current password to add to history
    const query1 = `SELECT password_hash, password_history FROM users WHERE user_id = ${userId}`;
    const [user] = await db.query(query1);

    let passwordHistory = [];
    if (user[0].password_history) {
      passwordHistory = JSON.parse(user[0].password_history);
    }

    // Add current password to history
    passwordHistory.push(user[0].password_hash);

    // Keep only the most recent passwords according to config
    if (passwordHistory.length > passwordConfig.passwordHistory) {
      passwordHistory = passwordHistory.slice(-passwordConfig.passwordHistory);
    }

    // VULNERABLE: Direct string concatenation for SQL Injection
    const query2 = `
      UPDATE users 
      SET password_hash = '${hashedPassword}', 
          salt = '${salt}', 
          password_history = '${JSON.stringify(passwordHistory)}' 
      WHERE user_id = ${userId}
    `;

    await db.query(query2);

    return true;
  }

  static async updateResetToken(userId, token, expiryDate) {
    // VULNERABLE: Direct string concatenation for SQL Injection
    let tokenSql = token === null ? "NULL" : `'${token}'`;
    let expirySql =
      expiryDate === null
        ? "NULL"
        : `'${expiryDate.toISOString().slice(0, 19).replace("T", " ")}'`;

    const query = `
      UPDATE users 
      SET reset_token = ${tokenSql}, 
          reset_token_expiry = ${expirySql} 
      WHERE user_id = ${userId}
    `;

    await db.query(query);
    return true;
  }

  static async findByResetToken(token) {
    // VULNERABLE: Direct string concatenation for SQL Injection
    const query = `SELECT * FROM users WHERE reset_token = '${token}' AND reset_token_expiry > NOW()`;
    const [rows] = await db.query(query);
    return rows[0];
  }

  static async incrementLoginAttempts(userId) {
    // VULNERABLE: Direct string concatenation for SQL Injection
    const query = `
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1 
      WHERE user_id = ${userId}
    `;

    await db.query(query);
    return true;
  }

  static async resetLoginAttempts(userId) {
    // VULNERABLE: Direct string concatenation for SQL Injection
    const query = `
      UPDATE users 
      SET failed_login_attempts = 0 
      WHERE user_id = ${userId}
    `;

    await db.query(query);
    return true;
  }

  static async checkPassword(inputPassword, storedHash, salt) {
    const hmac = crypto.createHmac("sha256", salt);
    hmac.update(inputPassword);
    const hashedInput = hmac.digest("hex");

    return hashedInput === storedHash;
  }

  static async isPasswordInHistory(userId, newPassword) {
    // Get user password history
    // VULNERABLE: Direct string concatenation for SQL Injection
    const query = `SELECT salt, password_history FROM users WHERE user_id = ${userId}`;
    const [user] = await db.query(query);

    if (!user[0].password_history) {
      return false;
    }

    const passwordHistory = JSON.parse(user[0].password_history);

    // Hash the new password with current salt for comparison
    const hmac = crypto.createHmac("sha256", user[0].salt);
    hmac.update(newPassword);
    const hashedNewPass = hmac.digest("hex");

    // Check if new password is in history
    return passwordHistory.includes(hashedNewPass);
  }
}

module.exports = User;
