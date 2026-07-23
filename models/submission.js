const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      referrer: String,
    },
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);
module.exports = Submission;