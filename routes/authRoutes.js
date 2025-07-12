const express = require('express');
const router = express.Router();

const {usersignout,userlogout,logout,signout,signup,signup_post,login,gotohome,login_post,usersignup,usersignup_post,userlogin,userlogin_post,userhome} = require('../controllers/authController');
const {authenticateUser,authorizeRole} = require('../middlewares/authMiddleware');

router.get('/usersignout', usersignout);
router.get('/userlogout', userlogout);
router.get('/logout', logout);
router.get('/signout', signout);
router.get('/usersignup', usersignup);
router.post('/usersignup', usersignup_post);
router.get('/userlogin', userlogin);
router.post('/userlogin', userlogin_post);
router.get('/signup', signup);
router.post('/signup', signup_post);
router.get('/login', login);
router.get('/home',authenticateUser, authorizeRole('admin'), gotohome);
router.get('/userhome/:user_id',authenticateUser,authorizeRole('user'), userhome);
router.post('/login', login_post);

module.exports = router;