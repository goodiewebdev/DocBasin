const express = require('express');
const router = express.Router();

const {createContactList} = require('../controllers/contactlist.js');

router.post('/add', createContactList);

module.exports = router;