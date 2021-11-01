'use strict';

let countryModel = require('./country.model');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');
var mongoose = require('mongoose');

const addCountry = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'code': 'required|string',
            'image': 'mimes:jpeg,jpg,png',
            'number_length': 'required',
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
            image_path: req.file.path,
            number_length: req.body.number_length,
        };

        // *get count of same country code
        let count = await countryModel.find({ code: req.body.code }).count()

        // *if country exist return false
        if(count > 0){
            res.status(400).json({
                message: "Country Code Already Exist",
            })
        } else {
            // *insert
            const country = new countryModel(obj); 
            await country.save();

            res.status(200).json({
                message: "Country Added Successfully",
            })
        }
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    addCountry: addCountry,
}