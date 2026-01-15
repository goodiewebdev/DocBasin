const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js')
const { createContactList, deleteContactList, getAllContactList, getContactListById, getUserContactLists, updateContactList } = require('../controllers/contactlist.js');

router.post('/add', auth, createContactList);
router.get('/allcontactlist', auth, getAllContactList);
router.get('/getcontactlistbyid/:contactListId', auth, getContactListById)
router.delete('/delete/:contactListId', auth, deleteContactList);
router.get('/mycontactlist', auth, getUserContactLists);
router.put('/update/:contactListId', auth, updateContactList);


module.exports = router;