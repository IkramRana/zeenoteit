'use strict';

let express = require('express');
let userCtrl = require('./user.controller');
let auth = require('../../services/auth.service');
let router = express.Router();


// *Prefix Path --- '/api/user'

//post
router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);

module.exports = router;