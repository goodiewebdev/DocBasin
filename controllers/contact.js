const Contact = require('../models/contact.js');
const ContactList = require('../models/contactlist.js');

const createContact = async (req, res) => {
    const { name, email} = req.body;
    const { contactListId } = req.params;
    try {
        const newContact = new Contact({
            name, email, contactList: contactListId
        })

        if (!email) {
            res.status(400).json({message: "Email is required"})
        }

        const contactListExist = await ContactList.findById(contactListId)

        if (!contactListExist) {
            return res.status(404).json({message: "Could not find Contact List, Create a Contact List first."})
        }

        await newContact.save();
        res.status(201).json(newContact)
    } catch {
        res.status(500).json({message: "Server error"})
    }
};

const getAllContact = async (req, res) => {
    try {
        const allContact = await Contact.find({})
        res.status(200).json(allContact);
    } catch {
        res.status(500).json({message: "Server error"})
    }
};

const deleteContact = async (req, res) => {
    try {
        const {contactId} = req.params;
        const contactToDelete = await Contact.findByIdAndDelete(contactId);

        if (!contactToDelete) {
            return res.status(404).json({message: "Could not find contact"});
        }

        res.status(200).json({message: "Contact deleted successfully"}, contactToDelete);
    } catch {
        res.status(500).json({message: "Server error"})
    }
};

module.exports = { createContact, getAllContact, deleteContact };