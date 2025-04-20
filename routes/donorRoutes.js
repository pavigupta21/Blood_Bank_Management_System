const express = require('express');
const router = express.Router();
const {addnewdonor,addnewdonor_post,readdonors,deletedonor,updatedonor,editdonor,donorlogtable,deletedonorlog,donationhistory,adddonation,medicalhistory} = require('../controllers/donorController');

router.get('/addnewdonor', addnewdonor);
router.post('/addnewdonor', addnewdonor_post);
router.get('/readdonors', readdonors);
router.get('/deletedonor/:donor_id', deletedonor);
router.post('/updatedonor/:donor_id', updatedonor);
router.get('/editdonor/:donor_id',editdonor);
router.get('/donorlogtable', donorlogtable);
router.get('/deletedonorlog/:entry_id',deletedonorlog);
router.get('/donationhistory/:donor_id',donationhistory);
router.post('/adddonation/:donor_id',adddonation);
router.get('/medicalhistory/:donor_id',medicalhistory);

module.exports = router;