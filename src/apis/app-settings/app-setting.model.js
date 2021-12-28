const mongoose = require("mongoose");

const AppSettingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  dailyOpenTime: {
    type: String,
    maxlength: 120,
    required: true,
  },
  dailyTimeInterval: {
    type: Number,
    maxlength: 5,
    default: 180,
    required: true,
  },
  timezoneOffset:{
    type: String,
    required: true,
  },
  isNotifyEnable: {
    type: Boolean,
    default: true,
  },
  creationAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
});


const AppSetting = mongoose.model("app_settings", AppSettingSchema);

module.exports = AppSetting;