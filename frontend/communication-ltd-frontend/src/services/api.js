import axios from "axios";

const API_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = (userData) => {
  return apiClient.post("/register", userData);
};

export const loginUser = (credentials) => {
  return apiClient.post("/login", credentials);
};

export const changePassword = (passwordData) => {
  return apiClient.post("/change-password", passwordData);
};

export const requestPasswordReset = (email) => {
  return apiClient.post("/forgot-password", { email });
};

export const resetPassword = (resetData) => {
  return apiClient.post("/reset-password", resetData);
};

export const addCustomer = (customerData) => {
  return apiClient.post("/customers", customerData);
};

export const getCustomers = () => {
  return apiClient.get("/customers");
};

export const getCustomerById = (id) => {
  return apiClient.get(`/customers/${id}`);
};

export default apiClient;
