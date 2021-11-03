const mongoose = require("mongoose");

const ThoughtSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  title: {
    type: String,
    maxlength: 255,
    required: true,
  },
  description: {
    type: String,
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

const Thought = mongoose.model("user_thoughts", ThoughtSchema);

module.exports = Thought;