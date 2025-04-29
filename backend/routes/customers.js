const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const auth = require("../middleware/auth");

router.use(auth);

router.post("/customers", customerController.addCustomer);

router.get("/customers", customerController.getCustomers);

router.get("/customers/:id", customerController.getCustomerById);

module.exports = router;
