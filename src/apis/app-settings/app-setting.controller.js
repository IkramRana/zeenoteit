'use strict';

let appSettingModel = require('./app-setting.model');
let userModel = require('../users/user.model');
var { encryptText,comparePassword } = require('../../services/app.services');
var { validator } = require('../../util/helper');
var { updateUserArray } = require('../../util/notification')
var errorHandler = require('../../util/errorHandler');

const updateSetting = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'email': 'required|email',
            'countryCode': 'required',
            'phoneNumber': 'required',
            'dailyOpenTime': 'required',
            'dailyTimeInterval': 'required',
            'isNotifyEnable': 'required',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });
        
        // *extract param from request body
        const { email, countryCode ,phoneNumber, dailyOpenTime, dailyTimeInterval, isNotifyEnable } = req.body;


        let setUserModelQuery = {};
        if (email) setUserModelQuery.email = email;
        if (countryCode) setUserModelQuery.countryCode = countryCode;
        if (phoneNumber) setUserModelQuery.phone_number = phoneNumber;

        let setAppSettingModelQuery = {};
        if (dailyOpenTime) setAppSettingModelQuery.dailyOpenTime = dailyOpenTime;
        if (dailyTimeInterval) setAppSettingModelQuery.dailyTimeInterval = dailyTimeInterval;
        if (isNotifyEnable) setAppSettingModelQuery.isNotifyEnable = isNotifyEnable;

        // *update user
        const updateUser = await userModel.findOneAndUpdate(
            { _id: req.user._id }, 
            { $set: setUserModelQuery }
        )
        
        // *update user settings
        const updateAppSetting = await appSettingModel.findOneAndUpdate(
            { user_id: req.user._id }, 
            { $set: setAppSettingModelQuery }
        )

        if(!updateUser || !updateAppSetting){
            return res.status(500).json({ 
                status: false,
                message: "Unexpected error" 
            });
        } else {
            updateUserArray();
            return res.status(200).json({
                status: true,
                message: "Settings Update Successfully",
            })
        }

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json({
            status: false,
            message: error
        })
    }
}

module.exports = {
    updateSetting: updateSetting,
}