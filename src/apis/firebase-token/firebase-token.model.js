const mongoose = require("mongoose");

const FirebaseTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  token: {
    type: String,
    required: true,
  },
  isLoggedIn: {
    type: Boolean,
    required: true,
  },
  creationAt: {
    type: Date,
    default: Date.now
  },
});

const FirebaseToken = mongoose.model("firebase_token", FirebaseTokenSchema);

module.exports = FirebaseToken;