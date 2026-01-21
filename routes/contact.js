const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.js");
const {
  createContact,
  getAllContact,
  deleteContact,
  getContactById,
  updateContact,
} = require("../controllers/contact.js");

router.post("/:contactListId", createContact);
router.get("/", auth, getAllContact);
router.delete("/:contactId", auth, deleteContact);
router.get("/:contactId", auth, getContactById);
router.put("/:contactId", auth, updateContact);

module.exports = router;
