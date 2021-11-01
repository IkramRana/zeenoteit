'use strict';

let quoteModel = require('./quote.model');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');
var mongoose = require('mongoose');

const addQuote = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'quote': 'required|string',
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
            user_id: req.user._id,
            quote: req.body.quote,
        };

        // *get count of same quote
        let count = await quoteModel.find({ user_id: req.user._id }).count()
        
        // *if code exist then update it else insert
        if(count > 0){
            await quoteModel.updateOne({
                'quote': req.body.quote
            });
            res.status(200).json({
                message: "Quote Updated Successfully",
            })
        } else {
            
            // *insert
            const quote = new quoteModel(obj); 
            await quote.save();

            res.status(200).json({
                message: "Quote Added Successfully",
            })
        }
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    addQuote: addQuote,
}