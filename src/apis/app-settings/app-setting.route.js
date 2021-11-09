'use strict';

let express = require('express');
let appSettingCtrl = require('./app-setting.controller');
let auth = require('../../services/auth.service');
let router = express.Router();


// *Prefix Path --- '/api/app-setting'

//post
router.post('/updateSetting', auth.validate, appSettingCtrl.updateSetting);


module.exports = router;