'use strict';

let userModel = require('./user.model');
var { encryptText,comparePassword } = require('../../services/app.services');
var jwt = require('../../services/jwt.service');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');


const register = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'email': 'required|email',
            'password': 'required',
            'country_id': 'required',
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
        const { email, password, country_id, phone_number, isNumberVerified } = req.body;
        // *encrypt incoming password
        const hashPassword = await encryptText(password);
        
        // *create obj for db insert
        let obj = {
            email: email,
            password: hashPassword,
            country_id: country_id,
            phone_number: phone_number,
            isNumberVerified: isNumberVerified,
        }
        
        // *insert
        const user = new userModel(obj); 
        await user.save();

        return res.send(user);
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

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
                    userName: result.name,
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

module.exports = {
    register: register,
    login: login,
}