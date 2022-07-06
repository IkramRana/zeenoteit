"use strict";

let appSettingModel = require("./app-setting.model");
let userModel = require("../users/user.model");
var { encryptText, comparePassword } = require("../../services/app.services");
var {
  validator,
  getMinFromString,
  convertMinToHr,
} = require("../../util/helper");
var errorHandler = require("../../util/errorHandler");
const axios = require("axios");

const updateSetting = async (req, res) => {
  try {
    // *request body validation
    const validationRule = {
      email: "required|email",
      countryCode: "required",
      phoneNumber: "required",
      dailyOpenTime: "required",
      dailyTimeInterval: "required",
      isNotifyEnable: "required",
      timezoneOffset: "required",
    };

    validator(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        return res.status(412).json({
          status: false,
          responseCode: 412,
          message: "Validation failed",
          data: err,
        });
      }
    });

    // *extract param from request body
    const {
      email,
      password,
      countryCode,
      phoneNumber,
      dailyOpenTime,
      dailyTimeInterval,
      isNotifyEnable,
      timezoneOffset,
    } = req.body;

    if (password) {
      if (password.length < 9) {
        return res.status(400).json({
          status: false,
          message: "Password length must be greater than equal to 8",
        });
      }
    }
    // *encrypt incoming password
    const hashPassword = await encryptText(password);

    let setUserModelQuery = {};
    if (email) setUserModelQuery.email = email;
    if (password) setUserModelQuery.password = hashPassword;
    if (countryCode) setUserModelQuery.countryCode = countryCode;
    if (phoneNumber) setUserModelQuery.phone_number = phoneNumber;

    let setAppSettingModelQuery = {};
    if (dailyOpenTime) {
      // *initialize date obj
      //const date = new Date();
      const getTimezoneOffset = timezoneOffset; //date.getTimezoneOffset();
      const openTimeMinutes = getMinFromString(dailyOpenTime);
      let minutesDifference = 0;

      if (getTimezoneOffset < 0) {
        minutesDifference =
          openTimeMinutes - parseInt(Math.abs(getTimezoneOffset));
      } else {
        minutesDifference =
          openTimeMinutes + parseInt(Math.abs(getTimezoneOffset));
      }
      const setUTCOpenTime = await convertMinToHr(minutesDifference);

      setAppSettingModelQuery.dailyOpenTime = setUTCOpenTime;
    }
    if (dailyTimeInterval)
      setAppSettingModelQuery.dailyTimeInterval = dailyTimeInterval;
    if (isNotifyEnable) setAppSettingModelQuery.isNotifyEnable = isNotifyEnable;

    // *update user
    const updateUser = await userModel.findOneAndUpdate(
      { _id: req.user._id },
      { $set: setUserModelQuery }
    );

    // *update user settings
    const updateAppSetting = await appSettingModel.findOneAndUpdate(
      { user_id: req.user._id },
      { $set: setAppSettingModelQuery }
    );

    if (!updateUser || !updateAppSetting) {
      return res.status(500).json({
        status: false,
        message: "Unexpected error",
      });
    } else {
      //let localURL = "http://localhost:3001/notifications/api/update/users";
      let liveURL = "http://app.zenoteit.com/notifications/api/update/users";
      const resp = await axios.get(liveURL);
      return res.status(200).json({
        status: true,
        message: "Settings Update Successfully",
      });
    }
  } catch (err) {
    let error = errorHandler.handle(err);
    return res.status(500).json({
      status: false,
      message: error,
    });
  }
};

module.exports = {
  updateSetting: updateSetting,
};
