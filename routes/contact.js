const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.js')
const { createContact, getAllContact, deleteContact, getContactById, updateContact } = require('../controllers/contact.js');

router.post('/add/:contactListId', createContact);
router.get('/allcontacts', getAllContact);
router.delete('/deletecontact/:contactId', deleteContact);
router.get('/contactbyid/:contactId', getContactById);
router.put('/updatecontact/:contactId', auth, updateContact);

module.exports = router;