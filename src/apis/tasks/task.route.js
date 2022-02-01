'use strict';

let express = require('express');
let taskCtrl = require('./task.controller');
let auth = require('../../services/auth.service')
let router = express.Router();


// *Prefix Path --- '/api/task'

//get
router.get('/user-tasks', auth.validate, taskCtrl.getUserTasks);

//post
router.post('/add-task', auth.validate, taskCtrl.addTask);

//patch
router.patch('/swap-task', auth.validate, taskCtrl.swapTask);
router.patch('/update-title', auth.validate, taskCtrl.updateTaskTitle);

//delete
router.delete('/delete-task', auth.validate, taskCtrl.deleteTask);

module.exports = router;