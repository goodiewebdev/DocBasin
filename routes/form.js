const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.js");
const {
  createForm,
  deleteForm,
  getAllFormsAdmin,
  getFormById,
  getUserForms,
  updateForm,
  getUserLatestForm,
} = require("../controllers/form.js");

router.post("/", auth, createForm);
router.get("/my-forms", auth, getUserForms);
router.get("/latest", auth, getUserLatestForm);
router.get("/admin/all", auth, getAllFormsAdmin);

router.get("/:formId", auth, getFormById);
router.put("/:formId", auth, updateForm);
router.delete("/:formId", auth, deleteForm);

module.exports = router;