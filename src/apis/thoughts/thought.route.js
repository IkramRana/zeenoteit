'use strict';

let express = require('express');
let thoughtCtrl = require('./thought.controller');
let auth = require('../../services/auth.service')
let router = express.Router();


// *Prefix Path --- '/api/thought'

//post
router.get('/get-thought', auth.validate, thoughtCtrl.getThought);
router.post('/add-thought', auth.validate, thoughtCtrl.addThought);
router.get('/get-thought-by', auth.validate, thoughtCtrl.getThoughtById);
router.patch('/update-thought', auth.validate, thoughtCtrl.updateThought);
router.delete('/delete-thought', auth.validate, thoughtCtrl.deleteThought);

module.exports = router;