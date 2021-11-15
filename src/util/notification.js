'use strict';

var { getMinHrFromString,getMinFromString } = require('./helper');

let userModel = require('../apis/users/user.model');
let appSettingModel = require('../apis/app-settings/app-setting.model');
let userNotificationModel = require('../apis/notifications/user-notifications.model');
let notificationLogModel = require('../apis/notification-log/notification-log.model');
let userNotificationLogModel = require('../apis/notification-log/user-notification-log.model');

var count = 0;  // *initialize count
var users = []; // *initialize users array
var userNotifications = []; // *initialize user notification array
var dailyUserNotificationCounts = []; // *initialize user notification count array
var updateNotificationLog = []; // *initialize update notification log array
var isCheckedNotificationLog = false; // *set isCheckedNotificationLog to false for the first time

const init = async () => {
    try {
        let userNotificationLog = []; // *initialize userNotificationLog array
        let notificationLog = []; // *initialize notificationLog array
        
        // *if users array is empty then fetch all active users from database
        if(users.length === 0){
            // *get all active users
            let searchQuery = {};
            searchQuery["isActive"] = true;

            let result = await userModel.aggregate([
                { $match: searchQuery },
                {
                    $lookup: {
                        from: 'app_settings',
                        localField: '_id',
                        foreignField: 'user_id',
                        as: 'userAppSettings',
                    },
                }
            ])

            result.map(function(val, index){
                // *push result to user array
                users.push(val);
            });
        }

        // *if user notification array is empty then fetch all notifications from database
        if(userNotifications.length === 0){

            let userFirstNotifications = await userNotificationModel.find({}).sort({_id: 1})

            userFirstNotifications.map(function(val, index){
                // *push result to user notification array
                userNotifications.push(val);
            });
        }
        
        // *set data object
        let d = new Date();
        let date = d.getFullYear() + '-' + (+d.getMonth() + 1) + '-' + d.getDate();

        // *if notification log haven't checked then check today's notification log count from database
        if(isCheckedNotificationLog === false){

            // *fetch count
            count = await notificationLogModel.find({
                creationAt:{$gte:new Date(date)}
            }).count();
            
            // *if checked count successful then set isCheckedNotificationLog to true for stop checking again from database
            isCheckedNotificationLog = true;
        }
        
        // *if notification logs are not empty
        if(count > 0){

            // *get current time
            let currMinutes = getMinFromString(d.toLocaleTimeString());
            console.log('file: notification.js => line 77 => init => currMinutes', currMinutes);

            // *if update notification log array is empty then fetch them from database
            if(updateNotificationLog.length === 0){
                let data = await notificationLogModel.find({
                    creationAt:{$gte:new Date(date)}
                })

                data.map(function(val, index){
                    // *push result to update notification log array
                    updateNotificationLog.push(val);
                });
            }

            // *execute loop on update notification log array
            updateNotificationLog.map(async function(val, index){

                // *get next minute
                let nextMinutes = getMinFromString(val.next_notification_time);
                console.log('file: notification.js => line 94 => updateNotificationLog.map => nextMinutes', nextMinutes);

                if(+currMinutes >= +nextMinutes){ 
                    
                    // *get last notification order number from user notification log table against this user
                    let userLastNotificationLog = await userNotificationLogModel.find({
                        creationAt:{$gte:new Date(date)},
                        user_id: val.user_id
                    }).limit(1).sort({notification_order_no: -1})

                    // *if user notification array is empty then fetch all notifications from database
                    if(userNotifications.length === 0){

                        let userFirstNotifications = await userNotificationModel.find({}).sort({_id: 1})

                        userFirstNotifications.map(function(val, index){
                            // *push result to user notification array
                            userNotifications.push(val);
                        });
                    }

                    let notificationOrderNo = (+userLastNotificationLog[0].notification_order_no + 1);
                    // *execute loop on user notification array
                    userNotifications.map(async function(item, index){
                        
                        if(notificationOrderNo === +item.order_no){

                            // *execute loop on active users
                            users.map(async function(user, index){
                                if(val.user_id.equals(user._id)){

                                    // *get user next notification time interval
                                    let nextNotificationTime = getMinHrFromString(d.toLocaleTimeString(), user.userAppSettings[0].dailyTimeInterval)
                                    
                                    // *create obj
                                    let notificationLogObj = {
                                        last_notification_time: d.toLocaleTimeString(),
                                        next_notification_time: nextNotificationTime,
                                    }

                                    // *update notification log model
                                    const updateTaskModel = await notificationLogModel.findOneAndUpdate(
                                        {creationAt:{$gte:new Date(date)},
                                         user_id: user._id }, 
                                        { $set: notificationLogObj }
                                    )

                                    // *update notification log array
                                    updateNotificationLog = [];
                                    let data = await notificationLogModel.find({
                                        creationAt:{$gte:new Date(date)}
                                    })
                    
                                    data.map(function(val, index){
                                        // *push result to update notification log array
                                        updateNotificationLog.push(val);
                                    });
                                }
                            })

                            let userNotificationLogObj = {
                                user_id: val.user_id,
                                notification_id: item._id,
                                notification_order_no: item.order_no,
                            }

                            // *insert into userNotificationLogModel
                            const userNotification = new userNotificationLogModel(userNotificationLogObj); 
                            await userNotification.save();

                            // *update daily user notification counts array
                            dailyUserNotificationCounts = [];
                            let notifyCount = await userNotificationLogModel.aggregate([
                                { $match: {creationAt: {$gte:new Date(date)}} },
                                {
                                    $group :
                                    {
                                        _id : "$user_id",
                                        notificationCount: { $sum: 1 }
                                    }
                                }
                            ])
                            notifyCount.map(function(val, index){
                                // *push result to  user notification counts array
                                dailyUserNotificationCounts.push(val);
                            });
                        }

                    });

                }
            })
            
        } else {
            // *set isCheckedNotificationLog to false to check count once again for today's notification
            isCheckedNotificationLog = false;

            // *split time
            let time = d.toLocaleTimeString();
            let splitTime = time.split(':');
            let hour = splitTime[0];

            // *send first notification of the day to all users at 9'o clock
            if(+hour === 10){
                // *get first notification
                let userFirstNotification = await userNotificationModel.find({}).limit(1).sort({_id: 1})

                // *execute loop on active users
                users.map(function(val, index){

                    // *get user next notification time interval
                    let nextNotificationTime = getMinHrFromString(d.toLocaleTimeString(), val.userAppSettings[0].dailyTimeInterval)

                    // *push userId / notificationId in userNotificationLog array
                    userNotificationLog.push(
                        {
                            user_id: val._id,
                            notification_id: userFirstNotification[0]._id,
                            notification_order_no: userFirstNotification[0].order_no,
                        }
                    )

                    // *push userId / last_notification_time / next_notification_time in notificationLog array
                    notificationLog.push(
                        {
                            user_id: val._id,
                            last_notification_time: d.toLocaleTimeString(),
                            next_notification_time: nextNotificationTime,
                        }
                    )
                })
                // *insert into userNotificationLogModel
                await userNotificationLogModel.insertMany(userNotificationLog); 
                // *insert into notificationLogModel
                await notificationLogModel.insertMany(notificationLog); 

                // *update notification log array
                let data = await notificationLogModel.find({
                    creationAt:{$gte:new Date(date)}
                })
                data.map(function(val, index){
                    // *push result to update notification log array
                    updateNotificationLog.push(val);
                });

                // *update daily user notification counts array
                let notifyCount = await userNotificationLogModel.aggregate([
                    { $match: {creationAt: {$gte:new Date(date)}} },
                    {
                        $group :
                        {
                            _id : "$user_id",
                            notificationCount: { $sum: 1 }
                        }
                    }
                ])
                notifyCount.map(function(val, index){
                    // *push result to  user notification counts array
                    dailyUserNotificationCounts.push(val);
                });
            }
        }

    } catch (error) {
        console.log('file: notification.js => line 10 => init => error', error);
    }
}

module.exports = {
    init
}