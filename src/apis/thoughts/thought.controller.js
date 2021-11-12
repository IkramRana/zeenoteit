'use strict';

let thoughtModel = require('./thought.model');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');
var mongoose = require('mongoose');

const getThought = async (req, res) => {
    try {
        let result = await thoughtModel.find({ user_id: req.user._id }, { updatedAt:0,__v: 0 });

        return res.status(200).json({
            status: true,
            message: 'User Thoughts',
            data: result
        })
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const getThoughtById = async (req, res) => {
    try {
        let result = await thoughtModel.find({ _id: req.query.id,user_id: req.user._id }, { updatedAt:0,__v: 0 });

        return res.status(200).json({
            status: true,
            message: 'User Thoughts',
            data: result
        })
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

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

const updateThought = async (req, res) => {
    try {
        
        // *request body validation
        const validationRule = {
            'id': 'required',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });

        const { title, description } = req.body;

        let setThoughtModelQuery = {};
        if (title) setThoughtModelQuery.title = title;
        if (description) setThoughtModelQuery.description = description;

        // *update thought
        const updateThoughtModel = await thoughtModel.findOneAndUpdate(
            { _id: req.body.id }, 
            { $set: setThoughtModelQuery }
        )

        if(!updateThoughtModel){
            return res.status(500).json({ 
                status: false,
                message: "Unexpected error" 
            });
        } else {
            return res.status(200).json({
                status: true,
                message: "Thought Updated Successfully",
            })
        }

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const deleteThought = async (req, res) => {
    try {
        
        // *request body validation
        const validationRule = {
            'id': 'required',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });

        let setThoughtModelQuery = {
            _id: req.body.id
        };
        
        // *delete thought
        const deleteThoughtModel = await thoughtModel.deleteOne( setThoughtModelQuery );

        if(!deleteThoughtModel){
            return res.status(500).json({ 
                status: false,
                message: "Unexpected error" 
            });
        } else {
            return res.status(200).json({
                status: true,
                message: "Thought Deleted Successfully",
            })
        }

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    getThought: getThought,
    addThought: addThought,
    updateThought: updateThought,
    deleteThought: deleteThought,
    getThoughtById: getThoughtById,
}