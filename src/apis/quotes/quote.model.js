const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema({
  day_no: {
    type: Number,
    unique: true,
    required: true,
  },
  quote: {
    type: String,
    maxlength: 550,
    required: true,
  },
  sponsor: {
    type: String,
    maxlength: 255,
    required: true,
  },
  author: {
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

const Quote = mongoose.model("user_quotes", QuoteSchema);

module.exports = Quote;