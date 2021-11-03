const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  title: {
    type: String,
    maxlength: 255,
    required: true,
  },
  color: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'colors',
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


const Task = mongoose.model("user_tasks", TaskSchema);

module.exports = Task;