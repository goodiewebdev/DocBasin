const mongoose = require('mongoose');

const contactListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            require: true
        },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const ContactList = mongoose.model("ContactList", contactListSchema);
module.exports = ContactList;