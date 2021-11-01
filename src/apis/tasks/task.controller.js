'use strict';

let taskModel = require('./task.model');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');
var mongoose = require('mongoose');

const addTask = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'title': 'required|string',
            'color': 'required|string',
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
            color: req.body.color,
        };

        // *get count of same task
        let count = await taskModel.find({ user_id: req.user._id,title: req.body.title }).count()

        // *if task exist then return
        if(count > 0){
            res.status(400).json({
                message: "Task Title Already Exist",
            })
        } else {
            // *insert
            const task = new taskModel(obj); 
            await task.save();
            
            res.status(200).json({
                message: "Task Created Successfully",
            })
        }
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    addTask: addTask,
}