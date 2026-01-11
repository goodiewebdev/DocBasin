const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js')
const {createContactList, deleteContactList, getAllContactList, getContactListById} = require('../controllers/contactlist.js');

router.post('/add', auth, createContactList);
router.get('/allcontactlist', getAllContactList);
router.get('/getcontactlistbyid/:contactListId', getContactListById)
router.delete('/delete/:contactListId', deleteContactList);


module.exports = router;