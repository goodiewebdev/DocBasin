const ContactList = require("../models/contactlist.js");

const createContactList = async (req, res) => {
  const { name, contact } = req.body;

  try {
    const newContactList = new ContactList({
      name,
      contact,
    });

    await newContactList.save();
    res.status(201).json({ message: "New Contact List Added", newContactList });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const getContactListById = async (req, res) => {
  const { contactListId } = req.params;

  try {
    const contactListById = await ContactList.findById(contactListId).populate(
      'contact'
    );
    if (!contactListById) {
      return res.status(404).json({ message: "Cannot find Contact List" });
    }
    res.status(200).json(contactListById);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
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

module.exports = { createContactList, getContactListById, deleteContactList, getAllContactList };
