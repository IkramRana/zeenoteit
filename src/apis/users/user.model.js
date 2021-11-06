const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    maxlength: 100,
  },
  password: {
    type: String,
    maxlength: 100,
    required: true,
  },
  countryCode: {
    type: String,
    maxlength: 5,
    required: true,
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