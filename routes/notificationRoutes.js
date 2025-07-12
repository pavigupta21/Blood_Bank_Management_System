const express = require('express');
const router = express.Router();

const { DonationOffer,Post_DonationOffer,TransfusionRequest,Post_TransfusionRequest,userNotify,adminNotify,updateStatus} = require('../controllers/notificationController');

router.get('/offerdonation/:user_id', DonationOffer);
router.post('/offerdonation/:user_id', Post_DonationOffer);
router.get('/requesttransfusion/:user_id', TransfusionRequest);
router.post('/requesttransfusion/:user_id', Post_TransfusionRequest);
router.get('/userhome/notify/:user_id', userNotify);
router.get('/home/notify', adminNotify);
router.post('/updatestatus/:notification_id', updateStatus);
module.exports = router;