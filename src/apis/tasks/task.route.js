'use strict';

let express = require('express');
let taskCtrl = require('./task.controller');
let auth = require('../../services/auth.service')
let router = express.Router();


// *Prefix Path --- '/api/task'

//post
router.post('/add-task', auth.validate, taskCtrl.addTask);
router.get('/user-tasks', auth.validate, taskCtrl.getUserTasks);

module.exports = router;