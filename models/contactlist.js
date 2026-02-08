const mongoose = require("mongoose");

const contactListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    notificationEmail: {
    type: String,
    lowercase: true,
    trim: true,
  },
  },
  {
    timestamps: true,
  },
);

const ContactList = mongoose.model("ContactList", contactListSchema);
module.exports = ContactList;
