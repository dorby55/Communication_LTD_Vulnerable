// Vulnerable version of models/User.js
const db = require("../config/db");
const crypto = require("crypto");
const passwordConfig = require("../config/password-config");

class User {
  static async create(username, password, email) {
    const salt = crypto.randomBytes(16).toString("hex");

    const hmac = crypto.createHmac("sha256", salt);
    hmac.update(password);
    const hashedPassword = hmac.digest("hex");

    const query = `
      INSERT INTO users (username, password_hash, email, salt, failed_login_attempts)
      VALUES ('${username}', '${hashedPassword}', '${email}', '${salt}', 0)
    `;

    const [result] = await db.query(query);
    return result.insertId;
  }

  static async findByUsername(username) {
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    const [rows] = await db.query(query);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    const [rows] = await db.query(query);
    return rows[0];
  }

  static async updatePassword(userId, newPassword) {
    const salt = crypto.randomBytes(16).toString("hex");

    const hmac = crypto.createHmac("sha256", salt);
    hmac.update(newPassword);
    const hashedPassword = hmac.digest("hex");

    const query1 = `SELECT password_hash, password_history FROM users WHERE user_id = ${userId}`;
    const [user] = await db.query(query1);

    let passwordHistory = [];
    if (user[0].password_history) {
      passwordHistory = JSON.parse(user[0].password_history);
    }

    passwordHistory.push(user[0].password_hash);

    if (passwordHistory.length > passwordConfig.passwordHistory) {
      passwordHistory = passwordHistory.slice(-passwordConfig.passwordHistory);
    }

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
    const query = `SELECT * FROM users WHERE reset_token = '${token}' AND reset_token_expiry > NOW()`;
    const [rows] = await db.query(query);
    return rows[0];
  }

  static async incrementLoginAttempts(userId) {
    const query = `
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1 
      WHERE user_id = ${userId}
    `;

    await db.query(query);
    return true;
  }

  static async resetLoginAttempts(userId) {
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
    const query = `SELECT salt, password_history FROM users WHERE user_id = ${userId}`;
    const [user] = await db.query(query);

    if (!user[0].password_history) {
      return false;
    }

    const passwordHistory = JSON.parse(user[0].password_history);

    const hmac = crypto.createHmac("sha256", user[0].salt);
    hmac.update(newPassword);
    const hashedNewPass = hmac.digest("hex");

    return passwordHistory.includes(hashedNewPass);
  }
}

module.exports = User;
