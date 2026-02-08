const express = require("express");
const router = express.Router();
//const auth = require("../middlewares/auth.js");
const {
  checkout,
} = require("../controllers/checkout.js");

router.get("/", checkout);

module.exports = router;
