const ContactList = require("../models/contactlist.js");
const Contact = require("../models/contact.js");
const User = require("../models/user.js");

const createContactList = async (req, res) => {
  const { name } = req.body;
  const user = User._id;

  if (!user) {
    return res.status(404).json({message: "User not found"})
  }

  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "user" && user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to create a Contact List" });
    }

    const newContactList = new ContactList({
      name, user
    });
    await newContactList.save();
    res.status(201).json({ message: "New Contact List Added", newContactList });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const getContactListById = async (req, res) => {
  const { contactListId } = req.params;

  const contactList = await ContactList.findById(contactListId);
  if (!contactList) {
    return res.status(404).json({ message: "Contact List not found" });
  }

  const contacts = await Contact.find({
    contactList: contactListId,
  });

  res.json({
    ...contactList.toObject(),
    contacts,
  });
};

const getAllContactList = async (req, res) => {
  try {
    const allContactList = await ContactList.find({});
    res.status(200).json(allContactList);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteContactList = async (req, res) => {
  const { contactListId } = req.params;
  try {
    const contactListToDelete = await ContactList.findByIdAndDelete(
      contactListId
    );
    if (!contactListToDelete) {
      return res.status(404).json({ message: "Cannot find Contact List" });
    }
    res.status(200).json({ message: "Contact List Deleted Successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

module.exports = {
  createContactList,
  getContactListById,
  deleteContactList,
  getAllContactList,
};
