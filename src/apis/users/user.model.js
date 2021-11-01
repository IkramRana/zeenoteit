const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    maxlength: 100,
  },
  password: {
    type: String,
    maxlength: 100,
    unique: true,
    required: true,
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'countries',
  },
  phone_number: {
    type: String,
    maxlength: 25,
    unique: true,
    required: true,
  },
  isNumberVerified: {
    type: Boolean,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  access_token: String,
  creationAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;