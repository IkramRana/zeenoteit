'use strict';

let express = require('express');
let subTaskCtrl = require('./sub-task.controller');
let auth = require('../../services/auth.service')
let router = express.Router();


// *Prefix Path --- '/api/subtask'

//post
router.post('/add-subtask', auth.validate, subTaskCtrl.addSubTask);
router.get('/subtask-by-task-id', auth.validate, subTaskCtrl.getUserSubTaskByTaskId);
router.patch('/swap-subtask', auth.validate, subTaskCtrl.swapSubTask);
router.patch('/complete-subtask', auth.validate, subTaskCtrl.completeSubtask);

module.exports = router;