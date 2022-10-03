const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
    method_id: {
        type: String,
        required: true,
    },
    last_digits: {
        type: String,
        required: true,
    },
    expiry: {
        type: String,
        required: true,
    },
    network: {
        type: String,
        required: true,
    },
    is_default: {
        type: Boolean,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    createdAt: {
        type: Date,
        default: Date.now,

    },
});

const Plan = mongoose.model("plans", planSchema);

module.exports = Plan;