const mongoose = require("mongoose");

const NotificationLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  last_notification_time: {
    type: String,
    maxlength: 255,
    required: true,
  },
  next_notification_time: {
    type: String,
    maxlength: 255,
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

const NotificationLog = mongoose.model("notification_log", NotificationLogSchema);

module.exports = NotificationLog;