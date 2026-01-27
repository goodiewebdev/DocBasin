const ContactList = require("../models/contactlist.js");
const Contact = require("../models/contact.js");
const User = require("../models/user.js");

const createContactList = async (req, res) => {
  const { name } = req.body;

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newContactList = new ContactList({
      name,
      user: user._id,
    });

    await newContactList.save();

    newContactList.updatedAt = Date.now();
    res.status(201).json({ message: "New Contact List Added", newContactList });
  } catch (err) {
    console.error("Create Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getContactListById = async (req, res) => {
  const { contactListId } = req.params;

  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const contactList = await ContactList.findById(contactListId);

    if (!contactList) {
      return res.status(404).json({ message: "Contact List not found" });
    }

    const ownerId = contactList.user ? contactList.user.toString() : null;
    const currentUserId = req.user.userId;

    if (ownerId !== currentUserId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to get this Contact List" });
    }

    const contacts = await Contact.find({ contactList: contactListId }).sort({
      createdAt: -1,
    });

    res.json({
      ...contactList.toObject(),
      contacts,
    });
  } catch (err) {
    console.error("Error in getContactListById:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllContactList = async (req, res) => {
  try {
    const allContactList = await ContactList.find({});
    const ownerId = allContactList.user ? allContactList.user.toString() : null;
    const currentUserId = req.user.userId;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to get this Contact List" });
    }
    res.status(200).json(allContactList);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteContactList = async (req, res) => {
  const { contactListId } = req.params;
  try {
    const contactList = await ContactList.findById(contactListId);

    if (!contactList) {
      return res.status(404).json({ message: "Contact List not found" });
    }

    const ownerId = contactList.user ? contactList.user.toString() : null;
    const currentUserId = req.user.userId;

    if (ownerId !== currentUserId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to get this Contact List" });
    }

    const contactListToDelete =
      await ContactList.findByIdAndDelete(contactListId);
    if (!contactListToDelete) {
      return res.status(404).json({ message: "Cannot find Contact List" });
    }

    await Contact.deleteMany({ contactList: contactListId });
    res.status(200).json({ message: "Contact List Deleted Successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", err });
  }
};

const getUserContactLists = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const userContactLists = await ContactList.find({
      user: currentUserId,
    }).sort({ updatedAt: -1 });

    if (!userContactLists || userContactLists.length === 0) {
      return res.status(404).json({ message: "No Contact Lists found" });
    }

    res.status(200).json(userContactLists);
  } catch (err) {
    console.error("Failed to fetch user's ContactList:", err);
    res.status(500).json({ message: "Server error." });
  }
};

const updateContactList = async (req, res) => {
  const { contactListId } = req.params;
  const { name } = req.body;

  try {
    const contactList = await ContactList.findById(contactListId);

    if (!contactList) {
      return res.status(404).json({ message: "Contact List not found" });
    }

    const ownerId = contactList.user ? contactList.user.toString() : null;
    const currentUserId = req.user.userId;

    if (ownerId !== currentUserId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to get this Contact List" });
    }

    const updatedContactList = await ContactList.findByIdAndUpdate(
      contactListId,
      { name },
      { new: true, runValidators: true },
    );

    if (!updatedContactList) {
      return res.status(404).json({ message: "Could not update contact list" });
    }

    res.status(200).json(updatedContactList);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getUserContactListsLatest = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const userContactLists = await ContactList.findOne({
      user: currentUserId,
    }).sort({ updatedAt: -1 });

    if (!userContactLists || userContactLists.length === 0) {
      return res.status(404).json({ message: "No Contact Lists found" });
    }

    res.status(200).json(userContactLists);
  } catch (err) {
    console.error("Failed to fetch user's ContactList:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createContactList,
  getContactListById,
  deleteContactList,
  getAllContactList,
  getUserContactLists,
  updateContactList,
  getUserContactListsLatest,
};
