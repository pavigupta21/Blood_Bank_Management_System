const express = require('express');
const router = express.Router();
const {incstock,incstock_post,decstock,decstock_post} = require('../controllers/stockController');

router.get('/incstock', incstock);
router.post('/incstock', incstock_post);
router.get('/decstock', decstock);
router.post('/decstock', decstock_post);
module.exports = router;