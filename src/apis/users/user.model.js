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

  stripe_customerId: {
    type: String
  },
  plan_identifier: {
    type: String,
    default: null
  },
  plan_active: {
    type: Boolean,
    default: false
  },
  plan_expiry: {
    type: Date,
    default: Date.now
  },
  plan_subscriptionId: {
    type: String,
    default: null
  },
  plan_receipt: {
    type: String,
    default: null
  },
  trial_used: {
    type: Boolean,
    default: false
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

const User = mongoose.model("User", UserSchema);

module.exports = User;