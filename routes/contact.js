const express = require('express');
const router = express.Router();
const { createContact, getAllContact, deleteContact } = require('../controllers/contact.js');

router.post('/add/:contactListId', createContact);
router.get('/allcontacts', getAllContact);
router.delete('/deletecontact/:contactId', deleteContact);

module.exports = router;