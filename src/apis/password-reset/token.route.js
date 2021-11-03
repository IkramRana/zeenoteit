'use strict';

let express = require('express');
let tokenCtrl = require('./token.controller');
let router = express.Router();

// *Prefix Path --- '/api/password-reset'

//post
router.post('/getPasswordResetLink', tokenCtrl.generateLink);
router.post('/resetPassword', tokenCtrl.resetPassword);

module.exports = router;