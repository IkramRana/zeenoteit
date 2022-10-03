const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    identifier: {
        type: String,
        required: true,
    },
    price_id: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,

    },
});

const Plan = mongoose.model("plans", planSchema);

module.exports = Plan;