'use strict';

let thoughtModel = require('./thought.model');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');
var mongoose = require('mongoose');

const addThought = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'title': 'required|string',
            'description': 'required|string',
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
            title: req.body.title,
            description: req.body.description,
        };

        // *insert
        const task = new thoughtModel(obj); 
        await task.save();

        res.status(200).json({
            message: "Thought Created Successfully",
        })

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    addThought: addThought,
}