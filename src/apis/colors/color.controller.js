'use strict';

let colorModel = require('./color.model');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');
var mongoose = require('mongoose');

const addColor = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'code': 'required|string',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });
        
        // *create obj for db insert
        let obj = {
            code: req.body.code,
        };

        // *get count of same color code
        let count = await colorModel.find({ code: req.body.code }).count()

        // *if code exist return false
        if(count > 0){
            res.status(400).json({
                message: "Color Already Exist",
            })
        } else {
            // *insert
            const color = new colorModel(obj); 
            await color.save();

            res.status(200).json({
                message: "Color Added Successfully",
            })
        }
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    addColor: addColor,
}