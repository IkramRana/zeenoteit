'use strict';

let userModel = require('../apis/users/user.model');
let notificationLogModel = require('../apis/notification-log/notification-log.model');
let userNotificationLogModel = require('../apis/notification-log/user-notification-log.model');
let userNotificationModel = require('../apis/notifications/user-notifications.model');

const init = async () => {
    try {
        let userNotificationLog = [];
        let notificationLog = [];

        // *get all active users
        let result = await userModel.find({
            isActive: true
        });
        
        // let d = new Date();
        // let date = d.getFullYear() + '-' + (+d.getMonth() + 1) + '-' + d.getDate();
        
        // let count = await notificationLogModel.find({
        //     creationAt:{$gte:new Date(date)}
        // }).count();
       
        // if(count > 0){
        //     console.log('file: notification.js => line 23 => init => count', count);
        // } else {
        //     let userFirstNotification = await userNotificationModel.find({}).limit(1).sort({_id: 1})
        //     result.map(function(val, index){
        //         userNotificationLog.push(
        //             {
        //                 user_id: val._id,
        //                 notification_id: userFirstNotification._id,
        //             }
        //         )
                
        //         notificationLog.push(
        //             {
        //                 user_id: val._id,
        //                 last_notification_time: d.toLocaleTimeString('it-IT'),
        //                 next_notification_time: d.toLocaleTimeString('it-IT'),
        //             }
        //         )
        //     })
        //     console.log('file: notification.js => line 45 => result.map => userNotificationLog', userNotificationLog);
        //     console.log('file: notification.js => line 46 => result.map => notificationLog', notificationLog);
        //     await userNotificationLogModel.insertMany(userNotificationLog);
        //     await notificationLogModel.insertMany(notificationLog);
        // }

    } catch (error) {
        console.log('file: notification.js => line 10 => init => error', error);
    }
}

module.exports = {
    init
}