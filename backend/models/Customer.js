const db = require("../config/db");

class Customer {
  static async create(customerData, createdBy) {
    const { name, email, phone, address, packageType, sector } = customerData;
    const query = `
      INSERT INTO customers (name, email, phone, address, package_type, sector, created_by, registration_date)
      VALUES ('${name}', '${email}', '${phone}', '${address}', '${packageType}', '${sector}', ${createdBy}, NOW())
    `;

    const [result] = await db.query(query);

    return {
      id: result.insertId,
      name,
      email,
      phone,
      address,
      packageType,
      sector,
    };
  }

  static async findAll() {
    const query = "SELECT * FROM customers ORDER BY registration_date DESC";
    const [rows] = await db.query(query);
    return rows;
  }

  static async findById(customerId) {
    const query = `SELECT * FROM customers WHERE customer_id = ${customerId}`;
    const [rows] = await db.query(query);
    return rows[0];
  }
}

module.exports = Customer;
