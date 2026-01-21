const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: Number,
  },
  contactList: {
    type: mongoose.Schema.ObjectId,
    ref: "ContactList",
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Contact = mongoose.model("Contact", ContactSchema);
module.exports = Contact;
