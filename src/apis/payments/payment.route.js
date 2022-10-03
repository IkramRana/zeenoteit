'use strict';

let express = require('express');
let paymentCtrl = require('./payment.controller');
let auth = require('../../services/auth.service');
let router = express.Router();


// *Prefix Path --- '/api/payment'

//post
router.post('/startFreeTrial', auth.validate,paymentCtrl.startFreeTrial);
router.get('/getSubscriptionKey',auth.validate, paymentCtrl.generateSubscriptionId);
router.post('/finalizeSubscription',auth.validate, paymentCtrl.validatePayment);


module.exports = router;