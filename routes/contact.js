const express = require("express");
const router = express.Router();
const cors = require("cors");
const auth = require("../middlewares/auth.js");
const {
  createContact,
  getAllContact,
  deleteContact,
  getContactById,
  updateContact,
} = require("../controllers/contact.js");

const publicCors = cors({
  origin: "*",
  methods: ["POST", "OPTIONS"],
});

router.options("/:contactListId", publicCors); 
router.post("/:contactListId", publicCors, createContact);
router.get("/", auth, getAllContact);
router.delete("/:contactId", auth, deleteContact);
router.get("/:contactId", auth, getContactById);
router.put("/:contactId", auth, updateContact);

module.exports = router;
