const Form = require("../models/form");
const Submission = require("../models/submission");
const User = require("../models/User");
const sanitize = require("../utils/sanitize");

const createForm = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const name = req.body.name ? sanitize(req.body.name) : "";
    if (!name) {
      return res.status(400).json({ message: "Form name is required" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newForm = new Form({
      name,
      user: user._id,
      notificationEmail: req.body.notificationEmail
        ? sanitize(req.body.notificationEmail)
        : user.email,
    });

    await newForm.save();

    res.status(201).json({ message: "New Form created", form: newForm });
  } catch (err) {
    console.error("Create Form Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getFormById = async (req, res) => {
  const { formId } = req.params;

  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const ownerId = form.user ? form.user.toString() : null;
    if (ownerId !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this form" });
    }

    const submissions = await Submission.find({ form: formId }).sort({
      createdAt: -1,
    });

    res.json({
      ...form.toObject(),
      submissions,
    });
  } catch (err) {
    console.error("Error in getFormById:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getUserForms = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const userForms = await Form.find({ user: currentUserId }).sort({
      updatedAt: -1,
    });

    res.status(200).json(userForms);
  } catch (err) {
    console.error("Failed to fetch user forms:", err);
    res.status(500).json({ message: "Server error." });
  }
};

const getUserLatestForm = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const latestForm = await Form.findOne({ user: currentUserId }).sort({
      updatedAt: -1,
    });

    if (!latestForm) {
      return res.status(404).json({ message: "No forms found" });
    }

    res.status(200).json(latestForm);
  } catch (err) {
    console.error("Failed to fetch latest form:", err);
    res.status(500).json({ message: "Server error." });
  }
};

const updateForm = async (req, res) => {
  const { formId } = req.params;

  try {
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const ownerId = form.user ? form.user.toString() : null;
    if (ownerId !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this form" });
    }

    const name = req.body.name ? sanitize(req.body.name) : form.name;
    const notificationEmail = req.body.notificationEmail
      ? sanitize(req.body.notificationEmail)
      : form.notificationEmail;

    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      { name, notificationEmail },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedForm);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteForm = async (req, res) => {
  const { formId } = req.params;

  try {
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const ownerId = form.user ? form.user.toString() : null;
    if (ownerId !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this form" });
    }

    await Form.findByIdAndDelete(formId);
    await Submission.deleteMany({ form: formId });

    res.status(200).json({ message: "Form and associated submissions deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const getAllFormsAdmin = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized. Admin access required." });
    }

    const allForms = await Form.find({});
    res.status(200).json(allForms);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const submitToForm = async (req, res) => {
  const { formId } = req.params;

  try {
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form endpoint not found" });
    }

    const formData = { ...req.body };

    if (formData._gotcha) {
      return res.status(200).json({ message: "Submission received" });
    }

    delete formData._gotcha;
    const redirectUrl = formData._next;
    delete formData._next;

    const newSubmission = new Submission({
      form: form._id,
      data: formData,
      metadata: {
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        referrer: req.headers["referer"] || req.headers["origin"],
      },
    });

    await newSubmission.save();

    if (req.headers["accept"]?.includes("text/html")) {
      return res.redirect(redirectUrl || "/thanks");
    }

    res.status(201).json({
      success: true,
      message: "Submission saved successfully",
      submissionId: newSubmission._id,
    });
  } catch (err) {
    console.error("Submission Error:", err);
    res.status(500).json({ message: "Failed to process form submission" });
  }
};

module.exports = {
  createForm,
  getFormById,
  getUserForms,
  getUserLatestForm,
  updateForm,
  deleteForm,
  getAllFormsAdmin,
  submitToForm,
};