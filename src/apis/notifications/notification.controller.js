'use strict';

let notificationTypeModel = require('./notification-type.model');
let userNotificationModel = require('./user-notifications.model');
let userNotificationLogModel = require('../notification-log/user-notification-log.model');
var { updateSocketUserNotificationArray } = require('../../util/notification')
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');

const addNotificationType = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'title': 'required|string',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });
        
        // *create obj for db insert
        let obj = {
            title: req.body.title,
        };

        // *insert
        const notificationType = new notificationTypeModel(obj); 
        await notificationType.save();

        res.status(200).json({
            status: true,
            message: "Notification Type Added Successfully",
        })
        
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json({
            status: false,
            message: error
        })
    }
}

const addUserNotification = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'type_id': 'required',
            'notification': 'required|string',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });

        // *get type title by type_id
        let result = await notificationTypeModel.findOne({
            _id: req.body.type_id
        });

        // *get last order number
        let orderNo = await userNotificationModel.find({}).limit(1).sort({order_no: -1})

        if(!orderNo){
            orderNo = 1;
        } else {
            orderNo = +orderNo[0].order_no + 1;
        }
        
        // *create obj for db insert
        let obj = {
            type_id: req.body.type_id,
            type_title: result.title,
            notification: req.body.notification,
            order_no: orderNo,
        };

        // *insert
        const userNotification = new userNotificationModel(obj); 
        await userNotification.save();

        res.status(200).json({
            status: true,
            message: "User Notification Added Successfully",
        })
        
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json({
            status: false,
            message: error
        })
    }
}

const getUserWiseNotifications = async (req, res) => {
    try {
        let notifications = [];

        // *set data object
        let d = new Date();
        let date = d.getFullYear() + '-' + (+d.getMonth() + 1) + '-' + d.getDate();

        let result = await userNotificationLogModel.aggregate([
            { $match: { $and:[ {"user_id":req.user._id,'creationAt':{$gte:new Date(date)}} ] }  },
            {
                $lookup: {
                    from: 'user_notifications',
                    localField: 'notification_id',
                    foreignField: '_id',
                    as: 'notifications',
                },
            },
            {
                $project: {
                    user_id: false,
                    notification_id: false,
                    notification_order_no: false,
                    updatedAt: false,
                    __v: false,
                    "notifications._id": false,
                    "notifications.type_id": false,
                    "notifications.creationAt": false,
                    "notifications.updatedAt": false,
                    "notifications.__v": false, 
                }
            }
        ])

        result.map(function(val, index){
            let time = JSON.stringify(val.creationAt);
            notifications.push({
                _id: val._id,
                isRead: val.isRead,
                notificationTitle: val.notifications[0].type_title,
                notificationDescription: val.notifications[0].notification,
                notificationOrder: val.notifications[0].order_no,
                notificationTime: time.substr(12,5)
            })
        })

        // *update read notification bit to true
        let userNotificationLogObj = {
            isRead: true,
        }

        const updateUserNotificationLogModel = await userNotificationLogModel.updateMany(
            { user_id: req.user._id,isRead: false }, 
            { $set: userNotificationLogObj }
        )
        
        if(updateUserNotificationLogModel){
            await updateSocketUserNotificationArray(date);
        }

        return res.status(200).json({
            status: true,
            message: 'Notifications',
            data: notifications
        })

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json({
            status: false,
            message: error
        })
    }
}

module.exports = {
    addNotificationType: addNotificationType,
    addUserNotification: addUserNotification,
    getUserWiseNotifications: getUserWiseNotifications
}