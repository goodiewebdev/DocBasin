const express = require("express");
const router = express.Router();

const { createCheckoutSession } = require("../controllers/checkout.js");

router.get("/", createCheckoutSession);

module.exports = router;