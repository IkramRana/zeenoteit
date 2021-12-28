'use strict';

let userModel = require('./user.model');
let appSettingModel = require('../app-settings/app-setting.model');
let firebaseToken = require('../firebase-token/firebase-token.model');
var { encryptText,comparePassword } = require('../../services/app.services');
var jwt = require('../../services/jwt.service');
var { validator,convertMinToHr,getMinFromString } = require('../../util/helper');
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

            // *check user is active or in active
            if(result.isActive === false){
                return res.status(404).json({
                    status: false,
                    message: 'Your Account is deactivated!, Contact us for further process'
                }) 
            }

            let searchQuery = {};
            searchQuery["email"] = req.body.email;

            let data = await userModel.aggregate([
                { $match: searchQuery },
                {
                    $lookup: {
                        from: 'app_settings',
                        localField: '_id',
                        foreignField: 'user_id',
                        as: 'appSettings',
                    },
                },
                {
                    $project: {
                        password: false,
                        isNumberVerified: false,
                        isActive: false,
                        creationAt: false,
                        updatedAt: false,
                        __v: false,
                        "appSettings._id": false,
                        "appSettings.user_id": false,
                        "appSettings.creationAt": false,
                        "appSettings.updatedAt": false,
                        "appSettings.__v": false,
                    }
                }
            
            ])

            // *initialize date obj
            //const date = new Date();
            const getTimezoneOffset = data[0].appSettings[0].timezoneOffset;//date.getTimezoneOffset();
            const defaultUTCOpenTime = getMinFromString(data[0].appSettings[0].dailyOpenTime);
            let minutesDifference = 0;

            if(getTimezoneOffset < 0) {
                minutesDifference = defaultUTCOpenTime + parseInt(Math.abs(getTimezoneOffset));
            } else {
                minutesDifference = defaultUTCOpenTime - parseInt(Math.abs(getTimezoneOffset));
            }

            const defaultOpenTime = await convertMinToHr(minutesDifference);
            // *set open time from utc to users gmt according
            data[0].appSettings[0].dailyOpenTime = defaultOpenTime;

            // *compare db password with request body password
            let compare_result = await comparePassword(req.body.password, result.password);

            // *generate JsonWebToken
            let token = await jwt.generateToken({
                id: result._id,
                email: result.email
            }, 'login');

            //* if password / token successful
            if(compare_result && token){

                // *firebase token
                if(req.body.firebase_token){
                    const result = await firebaseToken.find({ token: req.body.firebase_token });

                    if(result){
                        let setFireBaseTokenModelQuery = {
                            token: req.body.firebase_token
                        };
                        await firebaseToken.deleteOne(setFireBaseTokenModelQuery)
                    }

                    let tokenObj = {
                        user_id: data[0]._id,
                        token: req.body.firebase_token,
                        isLoggedIn: true
                    }
                    await firebaseToken.create(tokenObj);
                }

                // *success return
                return res.json({ 
                    status: true,
                    token: token,
                    user: data
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

const logout = async (req, res) => {
    try {
        const { firebase_token } = req.body.firebase_token;

        const result = await firebaseToken.find({ token: firebase_token });

        if(result) {
            let setFireBaseTokenModelQuery = {
                token: req.body.firebase_token
            };
            await firebaseToken.deleteOne(setFireBaseTokenModelQuery)
        }

        return res.status(200).json({
            status: true,
            message: "Logout Successfully",
        })
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
            'country_code': 'required',
            'phone_number': 'required',
            'isNumberVerified': 'required',
            'timezoneOffset': 'required'
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
        const { email, password, country_code ,phone_number, isNumberVerified, timezoneOffset } = req.body;

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

        if(user){

            // *initialize date obj
            //const date = new Date();
            const getTimezoneOffset = timezoneOffset;//date.getTimezoneOffset();
            const defaultOpenTime = 540; //09:00 for every user
            let minutesDifference = 0;

            if(getTimezoneOffset < 0) {
                minutesDifference = defaultOpenTime - parseInt(Math.abs(getTimezoneOffset));
            } else {
                minutesDifference = defaultOpenTime + parseInt(Math.abs(getTimezoneOffset));
            }

            const defaultUTCOpenTime = await convertMinToHr(minutesDifference);

            // *get user id by email
            let result = await userModel.findOne({
                email: req.body.email
            });

            const appSetting = new appSettingModel({
                user_id: result._id,  
                dailyOpenTime: defaultUTCOpenTime,
                timezoneOffset: getTimezoneOffset
            });

            await appSetting.save();
        }

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

const deactivateAccount = async (req, res) => {
    try {
        
        let setUserModelQuery = {
            isActive: false
        };

        // *deactivate account
        const updateUserModel = await userModel.findOneAndUpdate(
            { _id: req.user.id }, 
            { $set: setUserModelQuery }
        )

        if(!updateUserModel){
            return res.status(500).json({ 
                status: false,
                message: "Unexpected error" 
            });
        } else {
            return res.status(200).json({
                status: true,
                message: "Account Deleted Successfully",
            })
        }

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const userExist = async (req, res) => {
    try {

        // *request body validation
        const validationRule = {
            'phone': 'required',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });

        const { phone } = req.body;

        //* check if phone exist
        let phoneCount = await userModel.find({ phone_number: phone }).count()

        if(phoneCount > 0){
            return res.status(400).json({
                status: true,
                message: "Phone Number Exist",
            })
        }

        return res.status(400).json({
            status: false,
            message: "Phone Number Does Not Exist",
        })

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
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
    login: login,
    logout: logout,
    register: register,
    userExist: userExist,
    verifyToken: verifyToken,
    deactivateAccount: deactivateAccount,
    checkUserEmailAndPhone: checkUserEmailAndPhone,
}