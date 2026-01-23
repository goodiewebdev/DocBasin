const Contact = require("../models/contact.js");
const ContactList = require("../models/contactlist.js");

const createContact = async (req, res) => {
  const { name, email } = req.body;
  const { contactListId } = req.params;
  try {
    const newContact = new Contact({
      name,
      email: email.toLowerCase(),
      contactList: contactListId,
    });

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const contactList = await ContactList.findById(contactListId);

    if (!contactList) {
      return res.status(404).json({
        message: "Could not find Contact List, Create a Contact List first.",
      });
    }

    await newContact.save();

    contactList.updatedAt = Date.now();
    await contactList.save();

    res.status(201).json(newContact);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const getAllContact = async (req, res) => {
  try {
    const allContact = await Contact.find({});
    const ownerId = allContact.user ? allContact.user.toString() : null;
    const currentUserId = req.user.userId;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this contact" });
    }
    res.status(200).json(allContact);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contactToDelete = await Contact.findByIdAndDelete(contactId);

    if (!contactToDelete) {
      return res.status(404).json({ message: "Could not find contact" });
    }

    const ownerId = contactToDelete.user
      ? contactToDelete.user.toString()
      : null;
    const currentUserId = req.user.userId;

    if (ownerId !== currentUserId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this contact" });
    }

    res
      .status(200)
      .json({ message: "Contact deleted successfully" }, contactToDelete);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;

  try {
    const contactById = await Contact.findById(contactId);

    if (!contactById) {
      return res.status(404).json({ message: "Cannot find contact" });
    }

    const ownerId = contactById.user ? contactById.user.toString() : null;
    const currentUserId = req.user.userId;

    if (ownerId !== currentUserId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to get this contact" });
    }

    res.status(200).json(contactById);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const { name, email } = req.body;

  try {
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const contactList = await ContactList.findById(contact.contactList);

    if (!contactList) {
      return res
        .status(404)
        .json({ message: "Associated Contact List not found" });
    }

    const ownerId = contactList.user ? contactList.user.toString() : null;
    const currentUserId = req.user.userId;

    if (ownerId !== currentUserId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this contact" });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { name, email },
      { new: true, runValidators: true },
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Could not find contact" });
    }

    res.status(200).json(updatedContact);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createContact,
  getAllContact,
  deleteContact,
  getContactById,
  updateContact,
};
