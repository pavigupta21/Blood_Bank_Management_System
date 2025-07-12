const express = require('express');
const router = express.Router();
const {addnewdonor,addnewdonor_post,readdonors,deletedonor,updatedonor,editdonor,donorlogtable,deletedonorlog,donationhistory,adddonation,medicalhistory} = require('../controllers/donorController');
const {authenticateUser,authorizeRole} = require('../middlewares/authMiddleware');


router.get('/addnewdonor', authenticateUser,authorizeRole('admin'),addnewdonor);
router.post('/addnewdonor' ,addnewdonor_post);
router.get('/readdonors', authenticateUser,authorizeRole('admin'),readdonors);
router.get('/deletedonor/:donor_id', authenticateUser,authorizeRole('admin'),deletedonor);
router.post('/updatedonor/:donor_id', updatedonor);
router.get('/editdonor/:donor_id',authenticateUser,authorizeRole('admin'),editdonor);
router.get('/donorlogtable',authenticateUser,authorizeRole('admin'), donorlogtable);
router.get('/deletedonorlog/:entry_id',authenticateUser,authorizeRole('admin'),deletedonorlog);
router.get('/donationhistory/:donor_id',authenticateUser,authorizeRole('admin'),donationhistory);
router.post('/adddonation/:donor_id',adddonation);
router.get('/medicalhistory/:donor_id',authenticateUser,authorizeRole('admin'),medicalhistory);

module.exports = router;