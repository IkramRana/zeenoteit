'use strict';

var { getMinHrFromString,getMinFromString } = require('./helper');
var { updateArray } = require('../services/socket');

let userModel = require('../apis/users/user.model');
let appSettingModel = require('../apis/app-settings/app-setting.model');
let userNotificationModel = require('../apis/notifications/user-notifications.model');
let notificationLogModel = require('../apis/notification-log/notification-log.model');
let userNotificationLogModel = require('../apis/notification-log/user-notification-log.model');

var users = []; // *initialize users array
var userNotifications = []; // *initialize user notification array
var dailyUserNotificationCounts = []; // *initialize user notification count array
var updateNotificationLog = []; // *initialize update notification log array
var updateUserNotificationLog = []; // *initialize update user notification log array

const init = async () => {
    try {
        // *set data object
        let d = new Date();
        let date = d.getFullYear() + '-' + (+d.getMonth() + 1) + '-' + d.getDate();
                
        // *if users array is empty then fetch all active users from database
        if(users.length === 0){
            // *get all active users
            await updateUserArray();
        }

        // *if daily user's notification count array is empty then fetch from database for socket events
        if(dailyUserNotificationCounts.length === 0){
            await updateSocketUserNotificationArray(date);
        } else {
            updateArray(dailyUserNotificationCounts);
        }

        // *if user notification array is empty then fetch all notifications from database
        if(userNotifications.length === 0){
            await updateUserNotificationArray();
        }

        // *if updated notification log array is empty then fetch them from database
        if(updateNotificationLog.length === 0){
            await updateNotificationLogArray();
        }

         // *if updated user notification log array is empty then fetch them from database
        if(updateUserNotificationLog.length === 0){
            await updateUserNotificationLogArray();
        }

        // *get current total minutes
        let currentTotalMinutes = getMinFromString(d.toLocaleTimeString('en-GB'));
        console.log('file: notification.js => line 54 => init => currentTotalMinutes', currentTotalMinutes);

        // *split current time
        let currentTime = d.toLocaleTimeString('en-GB');
        let splitCurrentTime = currentTime.split(':');
        let currentHour = splitCurrentTime[0];
        let currentMinute = splitCurrentTime[1];
        console.log('file: notification.js => line 61 => init => currentMinute', +currentMinute);
        console.log('file: notification.js => line 62 => init => currentHour', +currentHour);
        
        // *execute loop on active users
        users.map(async function(user, index){

            // *split daily open time
            let dailyOpenTime = user.userAppSettings[0].dailyOpenTime;
            let splitDailyOpenTime = dailyOpenTime.split(':');
            let dailyOpenHour = splitDailyOpenTime[0];
            let dailyOpenMinute = splitDailyOpenTime[1];
            console.log('file: notification.js => line 72 => users.map => dailyOpenMinute', +dailyOpenMinute);
            console.log('file: notification.js => line 73 => init => dailyOpenHour', +dailyOpenHour);

            // *get user next notification time interval
            let nextNotificationTime = getMinHrFromString(d.toLocaleTimeString('en-GB'), user.userAppSettings[0].dailyTimeInterval)
            
            if(+currentHour === +dailyOpenHour){
                if(+currentMinute === +dailyOpenMinute){
                    console.log('ln 80 -> if');
                    let userCount = 0;
                    
                    // *check if user notification log array is empty
                    if(updateUserNotificationLog.length === 0){
                        await updateUserNotificationLogArray();
    
                        // *if empty then insert record
                        if(updateUserNotificationLog.length === 0){
                            // *get first notification
                            let userFirstNotification = await getUserNotifications();
    
                            let userId = user._id;
                            let notificationId = userFirstNotification[0]._id;
                            let notificationOrderNo = userFirstNotification[0].order_no;
                            let lastNotificationTime = d.toLocaleTimeString('en-GB');
    
                            // *insert into user notification log
                            await insertUserNotificationLogModel(userId,notificationId,notificationOrderNo);
    
                            // *insert into notification log
                            await insertNotificationLogModel(userId,lastNotificationTime,nextNotificationTime);
    
                            // *updated user notification log array
                            await updateUserNotificationLogArray();
    
                            // *update daily user notification counts array
                            await updateSocketUserNotificationArray(date);
                        } else {
                            // *execute loop on updated user notification log array
                            updateUserNotificationLog.map(async function(userNotification, index){
                                                
                                // *check user count
                                if(user._id.equals(userNotification._id)){
                                    userCount++;   
                                }
    
                                // *if user exist
                                if(userCount > 0){
                                    if(+userNotification.notification_order_no !== 1){
                                        // *get first notification
                                        let userFirstNotification = await getUserNotifications();
    
                                        let userId = user._id;
                                        let notificationId = userFirstNotification[0]._id;
                                        let notificationOrderNo = userFirstNotification[0].order_no;
                                        let lastNotificationTime = d.toLocaleTimeString('en-GB');
    
                                        // *insert into user notification log
                                        await insertUserNotificationLogModel(userId,notificationId,notificationOrderNo);
    
                                        // *update notification log
                                        await updateNotificationLogModel(userId,lastNotificationTime,nextNotificationTime);
    
                                        // *updated user notification log array
                                        await updateUserNotificationLogArray();   
    
                                        // *update daily user notification counts array
                                        await updateSocketUserNotificationArray(date);
                                    }
                                } else {
                                    // *get first notification
                                    let userFirstNotification = await getUserNotifications();
    
                                    let userId = user._id;
                                    let notificationId = userFirstNotification[0]._id;
                                    let notificationOrderNo = userFirstNotification[0].order_no;
                                    let lastNotificationTime = d.toLocaleTimeString('en-GB');
    
                                    // *insert into user notification log
                                    await insertUserNotificationLogModel(userId,notificationId,notificationOrderNo);
    
                                    // *insert into notification log
                                    await insertNotificationLogModel(userId,lastNotificationTime,nextNotificationTime);
    
                                    // *updated user notification log array
                                    await updateUserNotificationLogArray();
    
                                    // *update daily user notification counts array
                                    await updateSocketUserNotificationArray(date);
                                }
                            })
                        }
                    } else {
                        // *execute loop on updated user notification log array
                        updateUserNotificationLog.map(async function(userNotification, index){
                                            
                            // *check user count
                            if(user._id.equals(userNotification._id)){
                                userCount++;   
                            }
    
                            // *if user exist
                            if(userCount > 0){
                                if(+userNotification.notification_order_no !== 1){
    
                                    // *get first notification
                                    let userFirstNotification = await getUserNotifications();
    
                                    let userId = user._id;
                                    let notificationId = userFirstNotification[0]._id;
                                    let notificationOrderNo = userFirstNotification[0].order_no;
                                    let lastNotificationTime = d.toLocaleTimeString('en-GB');
    
                                    // *insert into user notification log
                                    await insertUserNotificationLogModel(userId,notificationId,notificationOrderNo);
    
                                    // *update notification log
                                    await updateNotificationLogModel(userId,lastNotificationTime,nextNotificationTime);
    
                                    // *updated user notification log array
                                    await updateUserNotificationLogArray();  
    
                                    // *update daily user notification counts array
                                    await updateSocketUserNotificationArray(date);
                                }
                            } else {
                                // *get first notification
                                let userFirstNotification = await getUserNotifications();
    
                                let userId = user._id;
                                let notificationId = userFirstNotification[0]._id;
                                let notificationOrderNo = userFirstNotification[0].order_no;
                                let lastNotificationTime = d.toLocaleTimeString('en-GB');
    
                                // *insert into user notification log
                                await insertUserNotificationLogModel(userId,notificationId,notificationOrderNo);
    
                                // *insert into notification log
                                await insertNotificationLogModel(userId,lastNotificationTime,nextNotificationTime);
    
                                // *updated user notification log array
                                await updateUserNotificationLogArray();
    
                                // *update daily user notification counts array
                                await updateSocketUserNotificationArray(date);
                            }
                        })
                    }
                } else {
                    console.log('ln 221 -> else');
                    let userCount = 0;
                    // *execute loop on update notification log array
                    updateNotificationLog.map(async function(notificationLog, index){

                        if(user._id.equals(notificationLog.user_id)){
                            userCount++;   
                        }

                        // *if user exist
                        if(userCount > 0){
                            // *get next minute
                            let nextNotificationTotalMinutes = getMinFromString(notificationLog.next_notification_time);
                            console.log('file: notification.js => line 94 => updateNotificationLog.map => nextNotificationTotalMinutes', nextNotificationTotalMinutes);

                            if(+currentTotalMinutes >= +nextNotificationTotalMinutes){ 
                                
                                // *get last notification order number from user notification log table against this user
                                let userLastNotificationLog = await getUserLastNotification(notificationLog.user_id);

                                // *if user notification array is empty then fetch all notifications from database
                                if(userNotifications.length === 0){
                                    await updateUserNotificationArray();
                                }

                                let notificationOrderNo = (+userLastNotificationLog[0].notification_order_no + 1);
                                // *execute loop on user notification array
                                userNotifications.map(async function(userFirstNotification, index){
                                    if(notificationOrderNo === +userFirstNotification.order_no){
                                        let userId = user._id;
                                        let notificationId = userFirstNotification._id;
                                        let notificationOrderNo = userFirstNotification.order_no;
                                        let lastNotificationTime = d.toLocaleTimeString('en-GB');

                                        // *insert into user notification log
                                        await insertUserNotificationLogModel(userId,notificationId,notificationOrderNo);

                                        // *update notification log
                                        await updateNotificationLogModel(userId,lastNotificationTime,nextNotificationTime);

                                        // *update notification log array
                                        await updateNotificationLogArray();

                                        // *updated user notification log array
                                        await updateUserNotificationLogArray();

                                        // *update daily user notification counts array
                                        await updateSocketUserNotificationArray(date);
                                    }
                                });
                            }
                        } else {
                            // *get next minute
                            let nextNotificationTotalMinutes = getMinFromString(notificationLog.next_notification_time);
                            console.log('file: notification.js => line 94 => updateNotificationLog.map => nextNotificationTotalMinutes', nextNotificationTotalMinutes);

                            if(+currentTotalMinutes >= +nextNotificationTotalMinutes){ 
                                
                                // *get last notification order number from user notification log table against this user
                                let userLastNotificationLog = await getUserLastNotification(notificationLog.user_id);

                                // *if user notification array is empty then fetch all notifications from database
                                if(userNotifications.length === 0){
                                    await updateUserNotificationArray();
                                }

                                let notificationOrderNo = (+userLastNotificationLog[0].notification_order_no + 1);

                                // *execute loop on user notification array
                                userNotifications.map(async function(userFirstNotification, index){
                                    if(notificationOrderNo === +userFirstNotification.order_no){
                                        let userId = user._id;
                                        let notificationId = userFirstNotification._id;
                                        let notificationOrderNo = userFirstNotification.order_no;
                                        let lastNotificationTime = d.toLocaleTimeString('en-GB');

                                        // *insert into user notification log
                                        await insertUserNotificationLogModel(userId,notificationId,notificationOrderNo);

                                        // *insert into notification log
                                        await insertNotificationLogModel(userId,lastNotificationTime,nextNotificationTime);
                                    
                                        // *update notification log array
                                        await updateNotificationLogArray();

                                        // *updated user notification log array
                                        await updateUserNotificationLogArray();

                                        // *update daily user notification counts array
                                        await updateSocketUserNotificationArray(date);
                                    }
                                });
                            }
                        }
                    })
                }
            } else {
                console.log('ln 221 -> else');
                let userCount = 0;
                // *execute loop on update notification log array
                updateNotificationLog.map(async function(notificationLog, index){

                    if(user._id.equals(notificationLog.user_id)){
                        userCount++;   
                    }

                    // *if user exist
                    if(userCount > 0){
                        // *get next minute
                        let nextNotificationTotalMinutes = getMinFromString(notificationLog.next_notification_time);
                        console.log('file: notification.js => line 94 => updateNotificationLog.map => nextNotificationTotalMinutes', nextNotificationTotalMinutes);

                        if(+currentTotalMinutes >= +nextNotificationTotalMinutes){ 
                            
                            // *get last notification order number from user notification log table against this user
                            let userLastNotificationLog = await getUserLastNotification(notificationLog.user_id);

                            // *if user notification array is empty then fetch all notifications from database
                            if(userNotifications.length === 0){
                                await updateUserNotificationArray();
                            }

                            let notificationOrderNo = (+userLastNotificationLog[0].notification_order_no + 1);
                            // *execute loop on user notification array
                            userNotifications.map(async function(userFirstNotification, index){
                                if(notificationOrderNo === +userFirstNotification.order_no){
                                    let userId = user._id;
                                    let notificationId = userFirstNotification._id;
                                    let notificationOrderNo = userFirstNotification.order_no;
                                    let lastNotificationTime = d.toLocaleTimeString('en-GB');

                                    // *insert into user notification log
                                    await insertUserNotificationLogModel(userId,notificationId,notificationOrderNo);

                                    // *update notification log
                                    await updateNotificationLogModel(userId,lastNotificationTime,nextNotificationTime);

                                    // *update notification log array
                                    await updateNotificationLogArray();

                                    // *updated user notification log array
                                    await updateUserNotificationLogArray();

                                    // *update daily user notification counts array
                                    await updateSocketUserNotificationArray(date);
                                }
                            });
                        }
                    } else {
                        // *get next minute
                        let nextNotificationTotalMinutes = getMinFromString(notificationLog.next_notification_time);
                        console.log('file: notification.js => line 94 => updateNotificationLog.map => nextNotificationTotalMinutes', nextNotificationTotalMinutes);

                        if(+currentTotalMinutes >= +nextNotificationTotalMinutes){ 
                            
                            // *get last notification order number from user notification log table against this user
                            let userLastNotificationLog = await getUserLastNotification(notificationLog.user_id);

                            // *if user notification array is empty then fetch all notifications from database
                            if(userNotifications.length === 0){
                                await updateUserNotificationArray();
                            }

                            let notificationOrderNo = (+userLastNotificationLog[0].notification_order_no + 1);

                            // *execute loop on user notification array
                            userNotifications.map(async function(userFirstNotification, index){
                                if(notificationOrderNo === +userFirstNotification.order_no){
                                    let userId = user._id;
                                    let notificationId = userFirstNotification._id;
                                    let notificationOrderNo = userFirstNotification.order_no;
                                    let lastNotificationTime = d.toLocaleTimeString('en-GB');

                                    // *insert into user notification log
                                    await insertUserNotificationLogModel(userId,notificationId,notificationOrderNo);

                                    // *insert into notification log
                                    await insertNotificationLogModel(userId,lastNotificationTime,nextNotificationTime);
                                
                                    // *update notification log array
                                    await updateNotificationLogArray();

                                    // *updated user notification log array
                                    await updateUserNotificationLogArray();

                                    // *update daily user notification counts array
                                    await updateSocketUserNotificationArray(date);
                                }
                            });
                        }
                    }
                })
            }
        })
    } catch (error) {
        console.log('file: notification.js => line 10 => init => error', error);
    }
}


const getUserNotifications = async () => {
    try {
        let result = await userNotificationModel.find({}).limit(1).sort({_id: 1});
        return result;
    } catch (error) {
        console.log('file: notification.js => line 425 => getUserNotifications => error', error);
    }
}

const getUserLastNotification = async (userId) => {
    try {
        let result = await userNotificationLogModel.find({
            user_id: userId
        }).limit(1).sort({notification_order_no: -1})
        return result;
    } catch (error) {
        console.log('file: notification.js => line 425 => getUserNotifications => error', error);
    }
}

const insertUserNotificationLogModel = async (userId,notificationId,notificationOrderNo) => {
    try {
        // *create userNotificationLogObj
        let userNotificationLogObj = {
            user_id: userId,
            notification_id: notificationId,
            notification_order_no: notificationOrderNo,
        }

        // *insert into userNotificationLogModel
        const userNotificationLog = new userNotificationLogModel(userNotificationLogObj); 
        await userNotificationLog.save();
    } catch (error) {
        console.log('file: notification.js => line 434 => insertUserNotificationAndNotificationLog => error', error);
    }
}

const insertNotificationLogModel = async (userId,lastNotificationTime,nextNotificationTime) => {
    try {
        // *create notificationLogObj
        let notificationLogObj = {
            user_id: userId,
            last_notification_time: lastNotificationTime,
            next_notification_time: nextNotificationTime,
        }
        // *insert into notification log model
        const updateNotificationLogModel = new notificationLogModel(notificationLogObj); 
        await updateNotificationLogModel.save();
    } catch (error) {
        console.log('file: notification.js => line 434 => insertUserNotificationAndNotificationLog => error', error);
    }
}

const updateNotificationLogModel = async (userId,lastNotificationTime,nextNotificationTime) => {
    try {
        // *create notificationLogObj
        let notificationLogObj = {
            last_notification_time: lastNotificationTime,
            next_notification_time: nextNotificationTime,
        }

        // *update notification log model
        const updateNotificationLogModel = await notificationLogModel.findOneAndUpdate(
            { user_id: userId }, 
            { $set: notificationLogObj }
        )
    } catch (error) {
        console.log('file: notification.js => line 434 => insertUserNotificationAndNotificationLog => error', error);
    }
}

const updateUserArray = async () => {
    try {
         users = [];        
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
    } catch (error) {
      console.trace('Inside Catch => ', error);
    }
}

const updateUserNotificationArray = async () => {
    try {
        userNotifications = [];
        let userFirstNotifications = await userNotificationModel.find({}).sort({_id: 1})

        userFirstNotifications.map(function(userFirstNotification, index){
            // *push result to user notification array
            userNotifications.push(userFirstNotification);
        });
    } catch (error) {
        console.log('file: notification.js => line 654 => updateUserNotificationArray => error', error);
    }
}

const updateNotificationLogArray = async () => {
    try {
        updateNotificationLog = [];
        let data = await notificationLogModel.find({
            // creationAt:{$gte:new Date(date)}
         })

         data.map(function(val, index){
             // *push result to update notification log array
             updateNotificationLog.push(val);
         });
    } catch (error) {
        console.log('file: notification.js => line 649 => updateNotificationLogArray => error', error);
    }
}

const updateUserNotificationLogArray = async () => {
    try {
        updateUserNotificationLog = [];
        let userNotifications = await userNotificationLogModel.aggregate([
            {
                $sort:{
                    notification_order_no:-1
                }
            },
            {
                $group:{
                    "_id":"$user_id",
                    notification_order_no:{
                        $first:"$notification_order_no"
                    }
                }
            }
        ])
        userNotifications.map(function(val, index){
            // *push result to updated user notification log array
            updateUserNotificationLog.push(val);
        });
    } catch (error) {
        console.log('file: notification.js => line 644 => updateUserNotificationLogArray => error', error);
    }
}

const updateSocketUserNotificationArray = async (date) => {
    try {
        // *update daily user notification counts array
        dailyUserNotificationCounts = [];
        let notifyCount = await userNotificationLogModel.aggregate([
            //{ $match: {creationAt: {$gte:new Date(date)}} },
            { $match: { $and:[ {"isRead":false,'creationAt':{$gte:new Date(date)}} ] }  },
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
        updateArray(dailyUserNotificationCounts);
    } catch (error) {
        console.log('file: notification.js => line 764 => updateSocketUserNotificationArray => error', error);
    }
}

module.exports = {
    init,
    updateUserArray,
    updateSocketUserNotificationArray
}