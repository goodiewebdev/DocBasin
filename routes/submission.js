const express = require("express");
const router = express.Router();
const cors = require("cors");
const auth = require("../middlewares/auth.js");

const {
  submitToForm,
  getFormSubmissions,
  getSubmissionById,
  deleteSubmission,
  getFormStats,
} = require("../controllers/submission.js");

const publicCors = cors({
  origin: "*",
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
});

router.options("/f/:formId", publicCors);
router.post("/f/:formId", publicCors, submitToForm);

router.get("/stats/:formId", auth, getFormStats);
router.get("/form/:formId", auth, getFormSubmissions);

router.get("/:submissionId", auth, getSubmissionById);
router.delete("/:submissionId", auth, deleteSubmission);

module.exports = router;