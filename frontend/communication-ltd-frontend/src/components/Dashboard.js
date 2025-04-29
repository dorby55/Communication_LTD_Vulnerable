import React, { useState, useEffect, useCallback } from "react";
import { addCustomer, getCustomers } from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    packageType: "",
    sector: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (err) {
      setError("Failed to fetch customers");

      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleChange = (e) => {
    setNewCustomer({
      ...newCustomer,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await addCustomer(newCustomer);

      setCustomers([...customers, response.data]);

      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        address: "",
        packageType: "",
        sector: "",
      });

      setSuccess(
        `New customer ${response.data.name} has been added successfully!`
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add customer");

      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <h2>Communication_LTD System Dashboard</h2>

      <div className="user-actions">
        <a href="/change-password">Change Password</a>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="add-customer-section">
        <h3>Add New Customer</h3>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={newCustomer.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={newCustomer.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              value={newCustomer.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={newCustomer.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Package Type:</label>
            <select
              name="packageType"
              value={newCustomer.packageType}
              onChange={handleChange}
              required
            >
              <option value="">Select Package</option>
              <option value="basic">Basic Internet</option>
              <option value="standard">Standard Internet</option>
              <option value="premium">Premium Internet</option>
              <option value="business">Business Internet</option>
            </select>
          </div>

          <div className="form-group">
            <label>Sector:</label>
            <select
              name="sector"
              value={newCustomer.sector}
              onChange={handleChange}
              required
            >
              <option value="">Select Sector</option>
              <option value="residential">Residential</option>
              <option value="business">Business</option>
              <option value="education">Education</option>
              <option value="government">Government</option>
            </select>
          </div>

          <button type="submit">Add Customer</button>
        </form>
      </div>

      <div className="customers-list">
        <h3>Recent Customers</h3>
        {customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Package</th>
                <th>Sector</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customer_id || customer.id}>
                  <td dangerouslySetInnerHTML={{ __html: customer.name }}></td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.package_type || customer.packageType}</td>
                  <td>{customer.sector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
