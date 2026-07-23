const Submission = require("../models/submission.js");
const Form = require("../models/form.js");
const sanitize = require("../utils/sanitize.js");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const submitToForm = async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form endpoint not found." });
    }

    const formData = { ...req.body };

    if (formData._gotcha) {
      return res.status(200).json({ message: "Submission received" });
    }

    const redirectUrl = formData._next;
    delete formData._gotcha;
    delete formData._next;

    const sanitizedData = {};
    for (const [key, value] of Object.entries(formData)) {
      const sanitizedKey = sanitize(key);
      if (typeof value === "string") {
        sanitizedData[sanitizedKey] = sanitize(value);
      } else {
        sanitizedData[sanitizedKey] = value;
      }
    }

    const newSubmission = new Submission({
      form: form._id,
      data: sanitizedData,
      metadata: {
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        referrer: req.headers["referer"] || req.headers["origin"],
      },
    });

    await newSubmission.save();

    form.updatedAt = Date.now();
    await form.save();

    const recipientEmail = form.notificationEmail;
    if (recipientEmail) {
      const fieldListHtml = Object.entries(sanitizedData)
        .map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`)
        .join("");

      resend.emails.send({
        from: fromEmail,
        to: [recipientEmail],
        subject: `New Submission on ${form.name}`,
        html: `
          <h2>You received a new submission on <strong>${form.name}</strong></h2>
          <ul>${fieldListHtml}</ul>
        `,
      }).catch((emailErr) => console.error("Resend API Error:", emailErr));
    }

    if (req.headers["accept"]?.includes("text/html")) {
      return res.redirect(redirectUrl || "https://formspree.io/thanks");
    }

    res.status(201).json({
      message: "Submission received successfully",
      submission: newSubmission,
    });
  } catch (err) {
    console.error("Submission Error:", err);
    res.status(500).json({ message: "Server error handling submission" });
  }
};

const getFormSubmissions = async (req, res) => {
  const { formId } = req.params;

  try {
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    if (form.user.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const submissions = await Submission.find({ form: formId }).sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getSubmissionById = async (req, res) => {
  const { submissionId } = req.params;

  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const form = await Form.findById(submission.form);
    if (form.user.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(submission);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const form = await Form.findById(submission.form);
    if (form.user.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    await submission.deleteOne();
    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getFormStats = async (req, res) => {
  const { formId } = req.params;

  try {
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    if (form.user.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [dayStats, weekStats, monthStats, totalStats] = await Promise.all([
      Submission.countDocuments({ form: formId, createdAt: { $gte: startOfDay } }),
      Submission.countDocuments({ form: formId, createdAt: { $gte: startOfWeek } }),
      Submission.countDocuments({ form: formId, createdAt: { $gte: startOfMonth } }),
      Submission.countDocuments({ form: formId }),
    ]);

    res.status(200).json({
      today: dayStats,
      thisWeek: weekStats,
      thisMonth: monthStats,
      total: totalStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  submitToForm,
  getFormSubmissions,
  getSubmissionById,
  deleteSubmission,
  getFormStats,
};