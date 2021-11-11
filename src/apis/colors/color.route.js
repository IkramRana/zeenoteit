'use strict';

let express = require('express');
let colorCtrl = require('./color.controller');
let auth = require('../../services/auth.service')
let router = express.Router();


// *Prefix Path --- '/api/color'

//post
router.post('/add-color', auth.validate, colorCtrl.addColor);
router.get('/get-colors', auth.validate, colorCtrl.getColors);

module.exports = router;