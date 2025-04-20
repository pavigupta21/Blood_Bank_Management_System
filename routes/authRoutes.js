const express = require('express');
const router = express.Router();

const {logout,signout,signup,signup_post,login,gotohome,login_post } = require('../controllers/authController');
const authenticateUser = require('../middlewares/authMiddleware');

router.get('/logout', logout);
router.get('/signout', signout);
router.get('/signup', signup);
router.post('/signup', signup_post);
router.get('/login', login);
router.get('/home',authenticateUser, gotohome);
router.post('/login', login_post);

module.exports = router;