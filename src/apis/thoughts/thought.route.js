'use strict';

let express = require('express');
let thoughtCtrl = require('./thought.controller');
let auth = require('../../services/auth.service')
let router = express.Router();


// *Prefix Path --- '/api/thought'

//get
router.get('/get-thought', auth.validate, thoughtCtrl.getThought);
router.get('/get-thought-by', auth.validate, thoughtCtrl.getThoughtById);

//post
router.post('/add-thought', auth.validate, thoughtCtrl.addThought);

//patch
router.patch('/update-thought', auth.validate, thoughtCtrl.updateThought);

//delete
router.delete('/delete-thought', auth.validate, thoughtCtrl.deleteThought);

module.exports = router;