'use strict';

let express = require('express');
let thoughtCtrl = require('./thought.controller');
let auth = require('../../services/auth.service')
let router = express.Router();


// *Prefix Path --- '/api/thought'

//post
router.post('/add-thought', auth.validate, thoughtCtrl.addThought);
router.get('/get-thought', auth.validate, thoughtCtrl.getThought);

module.exports = router;