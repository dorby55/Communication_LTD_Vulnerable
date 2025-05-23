const db = require("../config/db");
const passwordConfig = require("../config/password-config");

class User {
  static async create(username, password, email) {
    const query = `
      INSERT INTO users (username, password, email, failed_login_attempts)
      VALUES ('${username}', '${password}', '${email}', 0)
    `;

    const [result] = await db.query(query);
    return result.insertId;
  }

  static async findByUsername(username) {
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    const [rows] = await db.query(query);
    return rows[0];
  }

  static async findByUsernameAndPassword(username, password) {
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    const [rows] = await db.query(query);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    console.log("SQL Query being executed:", query);
    const [rows] = await db.query(query);
    return rows[0];
  }

  //safe %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // static async create(username, password, email) {
  //   const query = `
  //     INSERT INTO users (username, password, email, failed_login_attempts)
  //     VALUES (?, ?, ?, 0)
  //   `;
  //   const [result] = await db.query(query, [username, password, email]);
  //   return result.insertId;
  // }

  // static async findByUsername(username) {
  //   const query = `SELECT * FROM users WHERE username = ?`;
  //   const [rows] = await db.query(query, [username]);
  //   return rows[0];
  // }

  // static async findByUsernameAndPassword(username, password) {
  //   const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
  //   const [rows] = await db.query(query, [username, password]);
  //   return rows[0];
  // }

  // static async findByEmail(email) {
  //   const query = `SELECT * FROM users WHERE email = ?`;
  //   const [rows] = await db.query(query, [email]);
  //   return rows[0];
  // }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  static async updatePassword(userId, newPassword) {
    const query1 = `SELECT password, password_history FROM users WHERE user_id = ${userId}`;
    const [user] = await db.query(query1);

    let passwordHistory = [];
    if (user[0].password_history) {
      passwordHistory = JSON.parse(user[0].password_history);
    }

    passwordHistory.push(user[0].password);

    if (passwordHistory.length > passwordConfig.passwordHistory) {
      passwordHistory = passwordHistory.slice(-passwordConfig.passwordHistory);
    }

    const query2 = `
      UPDATE users 
      SET password = '${newPassword}',  
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
        : `'${new Date(expiryDate.getTime() + 2 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")}'`;

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
    const query = `SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > UTC_TIMESTAMP()`;
    const [rows] = await db.query(query, [token]);
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

  static async isPasswordInHistory(userId, newPassword) {
    const query = `SELECT password_history FROM users WHERE user_id = ${userId}`;
    const [user] = await db.query(query);

    if (!user[0].password_history) {
      return false;
    }

    const passwordHistory = JSON.parse(user[0].password_history);

    return passwordHistory.includes(newPassword);
  }
}

module.exports = User;
