require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected successfully");
    connection.release();
  }
});

app.use("/api", authRoutes);
app.use("/api", customerRoutes);

app.get("/", (req, res) => {
  res.send("Communication_LTD API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
