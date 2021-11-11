const mongoose = require("mongoose");

const NotificationTypeSchema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: 255,
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

const NotificationType = mongoose.model("notification_type", NotificationTypeSchema);

module.exports = NotificationType;