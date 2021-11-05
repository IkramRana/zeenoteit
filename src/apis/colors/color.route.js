'use strict';

let express = require('express');
let colorCtrl = require('./color.controller');
let router = express.Router();


// *Prefix Path --- '/api/color'

//post
router.post('/add-color', colorCtrl.addColor);
router.get('/get-colors', colorCtrl.getColors);

module.exports = router;