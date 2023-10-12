'use strict';
let userModel = require('../users/user.model');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');
var mongoose = require('mongoose');
var moment = require('moment');
let Stripe = require('../../../config/stripe-config');
let AppleVerify = require('../../../config/apple-pay-config');
var jwt = require('../../services/jwt.service');



const startFreeTrial = async (req, res) => {
    try {
        let setUserModelQuery = {
            plan_active: true,
            plan_expiry: moment().add(14, "days").toDate(),
            plan_identifier: "trial",
            trial_used: true

        };

        const updateUserModel = await userModel.findOneAndUpdate(
            { _id: req.user.id },
            { $set: setUserModelQuery }
        )

        let token = await jwt.generateToken({
            id: req.user.id,
            email: req.user.email,
            plan_active: true
        }, 'login');

        return res.status(200).json({
            status: true, message: 'Free trial started.', token: token, plan_expiry: moment().add(14, "days").toDate(),
            plan_identifier: "trial"
        });

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const generateSubscriptionId = async (req, res) => {
    let customer;
    try {
try{
     customer = await Stripe.customers.retrieve(req.user.stripe_customerId);
    } catch (error) {
        if (error.type === 'StripeInvalidRequestError' && error.statusCode === 404) {
            // Customer not found, create a new customer
            customer = await Stripe.customers.create({
                email: req.user.email,
                // Add any other customer information here
            });
            req.user.stripe_customerId = customer.id
        } else {
            // Handle other errors as needed
            console.error('Error retrieving customer:', error);
        }
    }


    const subscription = await Stripe.subscriptions.create({
        customer: req.user.stripe_customerId,
        items: [{
            price: process.env.STRIPE_PRICE_ID,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription', payment_method_types: ["card"] },
        expand: ['latest_invoice.payment_intent'],
    });

    let setUserModelQuery = {

        // plan_identifier: "paid.gold",
        plan_subscriptionId: subscription.id,
        stripe_customerId : req.user.stripe_customerId

    };

    // *update account for payment information
    const updateUserModel = await userModel.findOneAndUpdate(
        { _id: req.user.id },
        { $set: setUserModelQuery }
    )

    return res.status(200).json({ status: true, cs_key: subscription.latest_invoice.payment_intent.client_secret, public_key: process.env.STRIPE_PUBLISHABLE_KEY });


} catch (err) {
    let error = errorHandler.handle(err)
    return res.status(500).json(error)
}
}

const validatePayment = async (req, res) => {
    try {

        let setUserModelQuery = {
            plan_active: true,
            plan_expiry: moment().add(30, "days").toDate(),
            trial_used: true,
            plan_identifier: "paid.gold",
        };

        if (req.body.flag == "apple") {
            // const validPay = await AppleVerify.validate({
            //     receipt: req.body.receipt,
            //   });

            //   if (validPay.status != "active") {
            //     return res.status(400).json({ status: false,message: 'Payment not completed.' });
            //   }

            //   setUserModelQuery["plan_receipt"] = req.body.receipt;
        }
        else {
            const subscription = await Stripe.subscriptions.retrieve(
                req.user.plan_subscriptionId
            );

            if (subscription.status != "active") {
                return res.status(400).json({ status: false, message: 'Payment not completed.' });
            }

        }


        // *update account
        const updateUserModel = await userModel.findOneAndUpdate(
            { _id: req.user.id },
            { $set: setUserModelQuery }
        )

        let token = await jwt.generateToken({
            id: req.user.id,
            email: req.user.email,
            plan_active: true
        }, 'login');


        return res.status(200).json({
            status: true, message: 'Subscription started.', token: token, plan_expiry: moment().add(30, "days").toDate(),
            plan_identifier: "paid.gold"
        });


    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    startFreeTrial: startFreeTrial,
    generateSubscriptionId: generateSubscriptionId,
    validatePayment: validatePayment,
}