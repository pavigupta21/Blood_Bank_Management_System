const express = require('express');
const router = express.Router();
const {addnewpatient,addnewpatient_post,readpatients,deletepatient,updatepatient,editpatient,patientlogtable,deletepatientlog,transfusionhistory,addtransfusion}= require('../controllers/patientController');
const {authenticateUser,authorizeRole} = require('../middlewares/authMiddleware');

router.get('/addnewpatient',authenticateUser,authorizeRole('admin'), addnewpatient);
router.post('/addnewpatient', addnewpatient_post);
router.get('/readpatients', authenticateUser,authorizeRole('admin'),readpatients);
router.get('/deletepatient/:patient_id',authenticateUser,authorizeRole('admin'), deletepatient);
router.post('/updatepatient/:patient_id',updatepatient);
router.get('/editpatient/:patient_id',authenticateUser,authorizeRole('admin'),editpatient);
router.get('/patientlogtable', authenticateUser,authorizeRole('admin'),patientlogtable);
router.get('/deletepatientlog/:entry_id',authenticateUser,authorizeRole('admin'),deletepatientlog);
router.get('/transfusionhistory/:patient_id',authenticateUser,authorizeRole('admin'),transfusionhistory);
router.post('/addtransfusion/:patient_id',addtransfusion)

module.exports = router;
