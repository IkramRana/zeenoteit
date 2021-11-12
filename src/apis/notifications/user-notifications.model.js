const mongoose = require("mongoose");

const UserNotificationSchema = new mongoose.Schema({
  type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'notification_type',
  },
  type_title: {
    type: String,
    maxlength: 255,
    required: true,
  },
  notification: {
    type: String,
    maxlength: 550,
    required: true,
  },
  order_no: {
    type: Number,
    unique: true,
    required: true,
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

const UserNotification = mongoose.model("user_notifications", UserNotificationSchema);

module.exports = UserNotification;