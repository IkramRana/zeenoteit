'use strict';

let subTaskModel = require('./sub-task.model');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');
var mongoose = require('mongoose');

const addSubTask = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'task_id': 'required',
            'title': 'required|string',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });
        
        // *get count of same sub task based on title/task_id/user_id
        let count = await subTaskModel.find({ 
            user_id: req.user._id,
            task_id: req.body.task_id,
            title: req.body.title 
        }).count()

        // *sub task exist 
        if(count > 0){
            res.status(400).json({
                message: "Sub Task Already Exist",
            })
        } else {
             // *check same sub task based on task_id/user_id
            let isExist = await subTaskModel.find({ 
                user_id: req.user._id,
                task_id: req.body.task_id
            }).count()

            // *if exist then increment last order sequence by 1
            if(isExist > 0){
                let result = await subTaskModel.findOne({task_id: req.body.task_id}).sort({orderSequence:-1});    
                // *create obj for db insert            
                var obj = {
                    user_id: req.user._id,
                    task_id: req.body.task_id,
                    title: req.body.title,
                    orderSequence: +result.orderSequence + 1, // *add 1 in last order sequence number
                };
            } else {
                // *create obj for db insert
                var obj = {
                    user_id: req.user._id,
                    task_id: req.body.task_id,
                    title: req.body.title,
                    orderSequence: 1,
                };
            }

            // *insert
            const task = new subTaskModel(obj); 
            await task.save();

            res.status(200).json({
                message: "Sub Task Created Successfully",
            })
        }
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const completeSubtask = async (req, res) => {
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

        let setSubTaskModelQuery = {
            isCompleted: true
        };

        // *update sub task
        const updateSubTaskModel = await subTaskModel.findOneAndUpdate(
            { _id: req.body.id }, 
            { $set: setSubTaskModelQuery }
        )

        if(!updateSubTaskModel){
            return res.status(500).json({ 
                status: false,
                message: "Unexpected error" 
            });
        } else {
            return res.status(200).json({
                status: true,
                message: "Sub Task Completed Successfully",
            })
        }

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    addSubTask: addSubTask,
    completeSubtask: completeSubtask,
}