const mongoose = require('mongoose');
const Contact = require('./contact.js');

const contactListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contact: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Contact',
        required: true
    }]

});

const ContactList = mongoose.model("ContactList", contactListSchema);
module.exports = ContactList;