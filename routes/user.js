const express = require('express');
const router = express.Router();

const {signupUser, loginUser, getAllUsers, getUserById, deleteUser} = require('../controllers/user.js');

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/getallusers', getAllUsers);
router.get('/:id', getUserById);
router.delete('/delete/:userIdToDelete', deleteUser)

module.exports = router;