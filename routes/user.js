const express = require('express');
const router = express.Router();

const {signupUser, loginUser, getAllUsers, getUserById} = require('../controllers/user.js');

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/getallusers', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;