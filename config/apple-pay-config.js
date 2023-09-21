const appleReceiptVerify = require('node-apple-receipt-verify');

const APPLE_SECRET_KEY = process.env.APPLE_SECRET_KEY

const AppleVerify = appleReceiptVerify.config({
    secret: APPLE_SECRET_KEY,
    environment: [process.env.APPLE_ENVIROMENT]
});
module.exports = AppleVerify