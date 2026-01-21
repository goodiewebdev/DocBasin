const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.js");
const {
  createContactList,
  deleteContactList,
  getAllContactList,
  getContactListById,
  getUserContactLists,
  updateContactList,
} = require("../controllers/contactlist.js");

router.post("/", auth, createContactList);
router.get("/", auth, getAllContactList);
router.get("/mycontactlist", auth, getUserContactLists);
router.get("/:contactListId", auth, getContactListById);
router.delete("/:contactListId", auth, deleteContactList);
router.put("/:contactListId", auth, updateContactList);

module.exports = router;
