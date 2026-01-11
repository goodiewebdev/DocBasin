const express = require('express');
const router = express.Router();

const {signupUser, loginUser, getLoggedInUser, getAllUsers, getUserById, deleteUser} = require('../controllers/user.js');
const auth = require('../middlewares/auth.js');

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/me', auth, getLoggedInUser);
router.get('/getallusers', getAllUsers);
router.get('/:id', getUserById);
router.delete('/delete/:userIdToDelete', deleteUser)

module.exports = router;