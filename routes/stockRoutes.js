const express = require('express');
const router = express.Router();
const {incstock,incstock_post,decstock,decstock_post} = require('../controllers/stockController');
const {authenticateUser,authorizeRole} = require('../middlewares/authMiddleware');


router.get('/incstock',authenticateUser,authorizeRole('admin') , incstock);
router.post('/incstock',incstock_post);
router.get('/decstock', authenticateUser,authorizeRole('admin') ,decstock);
router.post('/decstock',decstock_post);
module.exports = router;