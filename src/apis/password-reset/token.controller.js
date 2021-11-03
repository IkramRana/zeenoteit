'use strict';

const crypto = require("crypto");
let userModel = require('../users/user.model');
let tokenModel = require('./token.model');
var { validator } = require('../../util/helper');
const sendEmail = require("../../services/sendEmail");
var { encryptText } = require('../../services/app.services');
var errorHandler = require('../../util/errorHandler');


const generateLink = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'email': 'required|email',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, 
                    responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });

        const user = await userModel.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).json({
                status: false, 
                responseCode: 400,
                message: "user with given email doesn't exist"
            });

        let token = await tokenModel.findOne({ userId: user._id });
        if (!token) {
            token = await new tokenModel({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.EMAIL_URI}/reset-password/${user._id}/${token.token}`;
        await sendEmail(user.email, "Password reset", link);

        res.json({
            status: true,
            responseCode: 200,
            message: "password reset link sent to your email account"
        });
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const resetPassword = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'userId': 'required',
            'token': 'required',
            'password': 'required',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, 
                    responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });

        const user = await userModel.findById(req.body.userId);
        if (!user) return res.status(400).json({
            status: false,
            responseCode: 400,
            message: "Invalid link or expired"
        });

        const token = await tokenModel.findOne({
            userId: user._id,
            token: req.body.token,
        });
        if (!token) return res.status(400).json({
            status: false,
            responseCode: 400,
            message: "Invalid link or expired"
        });

        // *encrypt incoming password
        const hashPassword = await encryptText(req.body.password);

        user.password = hashPassword;
        await user.save();
        await token.delete();

        res.json({
            status: true,
            responseCode: 200,
            message: "password reset successfully"
        });
        
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}


module.exports = {
    generateLink: generateLink,
    resetPassword: resetPassword,
}