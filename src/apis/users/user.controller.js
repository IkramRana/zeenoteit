'use strict';

let userModel = require('./user.model');
var { encryptText,comparePassword } = require('../../services/app.services');
var jwt = require('../../services/jwt.service');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');


const login = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'email': 'required|email',
            'password': 'required',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });
        
        // *check user by email
        let result = await userModel.findOne({
            email: req.body.email
        });
        
        // *if input wrong credentials 
        if (!result) {
            return res.status(404).json({
                status: false,
                message: 'Invalid Credentials'
            })
        } else {
            // *compare db password with request body password
            let compare_result = await comparePassword(req.body.password, result.password);
            // *generate JsonWebToken
            let token = await jwt.generateToken({
                id: result._id,
                email: result.email
            }, 'login');
            //* if password / token successful
            if(compare_result && token){
                return res.json({ 
                    status: true,
                    token: token
                });
            } else {
                return res.status(404).json({
                    status: false,
                    message: 'Invalid Credentials'
                })
            }
        }
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const register = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'email': 'required|email',
            'password': 'required',
            'phone_number': 'required',
            'isNumberVerified': 'required',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });
        
        // *extract param from request body
        const { email, password, country_code ,phone_number, isNumberVerified } = req.body;

        // *encrypt incoming password
        const hashPassword = await encryptText(password);
        
        // *create obj for db insert
        let obj = {
            email: email,
            password: hashPassword,
            countryCode: country_code,
            phone_number: phone_number,
            isNumberVerified: isNumberVerified,
        }
        
        // *insert
        const user = new userModel(obj); 
        await user.save();

        return res.status(200).json({
            status: true,
            message: "Registration Successful",
        })
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json({
            status: false,
            message: error
        })
    }
}

const verifyToken = async (req, res) => {
    try {
        let token = req.body.token;

        // *if no token found, return response (without going to the next middleware)
        if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

        const decoded = await jwt.verifyToken(token);

        // *if can verify the token, set req.user and pass to next middleware
        let result = await userModel.findOne({
            _id: decoded.id
        }, { 'reset_expiry': 0 });

        if (result) {
            return res.status(200).json({ status: true,message: 'verified' });
        }
            
        return res.status(401).json({ status: false,message: 'Invalid token.' });
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json({
            status: false,
            message: error
        })
    }
}

const checkUserEmailAndPhone = async (req,res) => {
    try {
        
        //* check if email exist
        let emailCount = await userModel.find({ email: req.body.email }).count()

        if(emailCount > 0){
            return res.status(400).json({
                status: false,
                message: "Email Already Exist",
            })
        }
        
        //* check if phone exist
        let phoneCount = await userModel.find({ phone_number: req.body.phone }).count()

        if(phoneCount > 0){
            return res.status(400).json({
                status: false,
                message: "Phone Number Already Exist",
            })
        }

        return res.json({ 
            status: true,
            message: 'No User Found'
        })

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    checkUserEmailAndPhone: checkUserEmailAndPhone,
    verifyToken: verifyToken,
    register: register,
    login: login,
}