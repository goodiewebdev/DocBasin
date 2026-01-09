const ContactList = require("../models/contactlist.js");

const createContactList = async (req, res) => {
    const {name, contact} = req.body;

    try {
        const newContactList = new ContactList({
            name, contact
        });

        await newContactList.save();
        res.status(201).json({message: "New Contact List Added", newContactList})
    } catch {
        res.status(500).json({message: "Server error"})
    }
}

module.exports = { createContactList };