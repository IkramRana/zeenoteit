'use strict';

let express = require('express');
let userCtrl = require('./user.controller');
let auth = require('../../services/auth.service');
let router = express.Router();


// *Prefix Path --- '/api/user'

//post
router.post('/login', userCtrl.login);
router.post('/register', userCtrl.register);
router.post('/userExist', userCtrl.userExist);
router.post('/verifyToken', userCtrl.verifyToken);
router.post('/logout', auth.validate, userCtrl.logout);
router.post('/checkUserEmailAndPhone', userCtrl.checkUserEmailAndPhone);

//patch
router.patch('/deactivateAccount', auth.validate, userCtrl.deactivateAccount);

module.exports = router;