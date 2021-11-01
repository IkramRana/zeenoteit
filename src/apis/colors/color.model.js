const mongoose = require("mongoose");

const ColorSchema = new mongoose.Schema({
  code: {
    type: String,
    maxlength: 20,
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

const Color = mongoose.model("colors", ColorSchema);

module.exports = Color;