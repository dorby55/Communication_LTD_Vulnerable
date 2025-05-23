const db = require("../config/db");

class Customer {
  static async create(customerData) {
    const { id, first_name, last_name } = customerData;
    const query = `
      INSERT INTO customers (id, first_name, last_name)
      VALUES (${id}, '${first_name}', '${last_name}')
    `;

    await db.query(query);

    return {
      id,
      first_name,
      last_name,
    };
  }

  static async findAll() {
    const query = "SELECT * FROM customers ORDER BY first_name";
    const [rows] = await db.query(query);
    return rows;
  }

  static async findById(customerId) {
    const query = `SELECT * FROM customers WHERE id = ${customerId}`;
    const [rows] = await db.query(query);
    return rows[0];
  }
}

module.exports = Customer;
