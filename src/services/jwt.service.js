'use strict';

var jwt = require('jsonwebtoken');

// *generate token function
const generateToken = async (payload, type) => {
    try {
        if (type == 'forgot') {
            let token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: process.env.TOKEN_EXPIRY_TIME });
            return token;
        } else {
            let token = await jwt.sign(payload, process.env.JWT_SECRET_KEY);
            return token;
        }
    } catch (error) {
        return error
    }
}

// *verify token function
const verifyToken = async token => {
    try {
        let result = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        return result;
    } catch (error) {
        return error;
    }
}

module.exports = {
    generateToken,
    verifyToken
}