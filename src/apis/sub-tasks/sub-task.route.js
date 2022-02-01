'use strict';

let express = require('express');
let subTaskCtrl = require('./sub-task.controller');
let auth = require('../../services/auth.service')
let router = express.Router();


// *Prefix Path --- '/api/subtask'

//get
router.get('/subtask-by-task-id', auth.validate, subTaskCtrl.getUserSubTaskByTaskId);

//post
router.post('/add-subtask', auth.validate, subTaskCtrl.addSubTask);

//delete
router.delete('/delete-subtask', auth.validate, subTaskCtrl.deleteSubTask);

//patch
router.patch('/swap-subtask', auth.validate, subTaskCtrl.swapSubTask);
router.patch('/check-uncheck-subtask', auth.validate, subTaskCtrl.checkUncheckSubtask);



module.exports = router;