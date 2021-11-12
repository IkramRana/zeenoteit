const mongoose = require("mongoose");

const UserNotificationLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  notification_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user_notifications',
  },
  notification_order_no: {
    type: Number,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
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

const UserNotificationLog = mongoose.model("user_notification_logs", UserNotificationLogSchema);

module.exports = UserNotificationLog;