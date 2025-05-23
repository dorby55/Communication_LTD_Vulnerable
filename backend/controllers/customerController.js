const Customer = require("../models/Customer");

exports.addCustomer = async (req, res) => {
  try {
    const { id, first_name, last_name } = req.body;

    const customer = await Customer.create({ id, first_name, last_name });

    res.status(201).json(customer);
  } catch (err) {
    console.error("Add customer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (err) {
    console.error("Get customers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (err) {
    console.error("Get customer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
