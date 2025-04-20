const express = require('express');
const router = express.Router();
const {addnewpatient,addnewpatient_post,readpatients,deletepatient,updatepatient,editpatient,patientlogtable,deletepatientlog,transfusionhistory,addtransfusion}= require('../controllers/patientController');

router.get('/addnewpatient', addnewpatient);
router.post('/addnewpatient', addnewpatient_post);
router.get('/readpatients', readpatients);
router.get('/deletepatient/:patient_id', deletepatient);
router.post('/updatepatient/:patient_id',updatepatient);
router.get('/editpatient/:patient_id',editpatient);
router.get('/patientlogtable', patientlogtable);
router.get('/deletepatientlog/:entry_id',deletepatientlog);
router.get('/transfusionhistory/:patient_id',transfusionhistory);
router.post('/addtransfusion/:patient_id',addtransfusion)

module.exports = router;
