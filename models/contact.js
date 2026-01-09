const mongoose = require('mongoose');
const ContactList = require('./contactlist');

const ContactSchema = new mongoose.Schema ({
    name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: Number,
    },
    contactList: {
        type: mongoose.Schema.ObjectId,
        ref: 'ContactList',
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const Contact = mongoose.model('Contact', ContactSchema);
module.exports = Contact;