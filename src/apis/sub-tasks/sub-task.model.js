const mongoose = require("mongoose");

const SubTaskSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user_tasks',
  },
  title: {
    type: String,
    maxlength: 255,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  orderSequence: {
    type: Number,
    required: true,
  },
  completionDate: {
    type: Date,
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

const SubTask = mongoose.model("user_sub_tasks", SubTaskSchema);

module.exports = SubTask;