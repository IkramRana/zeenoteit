'use strict';

let express = require('express');

// *app routes
let userRoutes = require('../apis/users/user.route');
let quoteRoutes = require('../apis/quotes/quote.route');
let taskRoutes = require('../apis/tasks/task.route');
let subTaskRoutes = require('../apis/sub-tasks/sub-task.route');
let thoughtsRoutes = require('../apis/thoughts/thought.route');
let colorsRoutes = require('../apis/colors/color.route');
let passwordResetRoutes = require('../apis/password-reset/token.route');
let appSettings = require('../apis/app-settings/app-setting.route');
let notification = require('../apis/notifications/notification-route');

let router = express.Router();

// *Prefix Path --- '/api/'
router.use('/user', userRoutes);
router.use('/quote', quoteRoutes);
router.use('/task', taskRoutes);
router.use('/subtask', subTaskRoutes);
router.use('/thought', thoughtsRoutes);
router.use('/color', colorsRoutes);
router.use('/password-reset', passwordResetRoutes);
router.use('/app-settings', appSettings);
router.use('/notification', notification);

module.exports = router;