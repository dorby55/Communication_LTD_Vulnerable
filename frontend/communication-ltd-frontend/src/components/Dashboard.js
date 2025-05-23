import React, { useState, useEffect, useCallback } from "react";
import { addCustomer, getCustomers, getCustomerById } from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    id: "",
    first_name: "",
    last_name: "",
  });
  const [searchId, setSearchId] = useState("");
  const [searchedCustomer, setSearchedCustomer] = useState(null);
  const [searchError, setSearchError] = useState("");
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
      setNewCustomer({ id: "", first_name: "", last_name: "" });
      setSuccess(
        `New customer ${response.data.first_name} has been added successfully!`
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

  const handleSearch = async () => {
    setSearchedCustomer(null);
    setSearchError("");

    if (!searchId) {
      setSearchError("Please enter a customer ID");
      return;
    }

    try {
      const response = await getCustomerById(searchId);
      setSearchedCustomer(response.data);
    } catch (err) {
      setSearchError(err.response?.data?.message || "Customer not found");
    }
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
            <label>ID:</label>
            <input
              type="number"
              name="id"
              value={newCustomer.id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="first_name"
              value={newCustomer.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="last_name"
              value={newCustomer.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Add Customer</button>
        </form>
      </div>

      <div className="search-customer-section">
        <h3>Find Customer by ID</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter customer ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        {searchError && <div className="error-message">{searchError}</div>}

        {searchedCustomer && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{searchedCustomer.id}</td>
                <td>{searchedCustomer.first_name}</td>
                <td>{searchedCustomer.last_name}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div className="customers-list">
        <h3>Customers</h3>
        {customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td
                    dangerouslySetInnerHTML={{ __html: customer.first_name }}
                  ></td>
                  <td>{customer.last_name}</td>
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
