'use strict';

let express = require('express');
let subTaskCtrl = require('./sub-task.controller');
let auth = require('../../services/auth.service')
let router = express.Router();


// *Prefix Path --- '/api/subtask'

//post
router.post('/add-subtask', auth.validate, subTaskCtrl.addSubTask);

module.exports = router;