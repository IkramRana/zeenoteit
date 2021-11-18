'use strict';

let express = require('express');
let notificationCtrl = require('./notification.controller');
let auth = require('../../services/auth.service')
let router = express.Router();


// *Prefix Path --- '/api/notification'

//post
router.post('/add-notification-type', auth.validate, notificationCtrl.addNotificationType);
router.post('/add-user-notification', auth.validate, notificationCtrl.addUserNotification);

//get
router.get('/user-notifications', auth.validate, notificationCtrl.getUserWiseNotifications);

module.exports = router;