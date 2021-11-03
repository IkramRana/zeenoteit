'use strict';

let taskModel = require('./task.model');
let subTaskModel = require('../sub-tasks/sub-task.model');
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

const getUserTasks = async (req, res) => {
    try {
        let searchQuery = {};
        searchQuery["user_id"] = req.user._id;

        let result = await taskModel.aggregate([
            { $match: searchQuery },
            {
                $lookup: {
                    from: 'user_sub_tasks',
                    localField: '_id',
                    foreignField: 'task_id',
                    as: 'subtasks',
                },
            },
            {
                $project: {
                    user_id: false,
                    creationAt: false,
                    updatedAt: false,
                    __v: false,
                    "subtasks.user_id": false,
                    "subtasks.creationAt": false,
                    "subtasks.updatedAt": false,
                    "subtasks.__v": false,
                }
            }
        
        ])

        return res.status(200).json({
            message: 'All Tasks',
            data: result
        })
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    addTask: addTask,
    getUserTasks: getUserTasks,
}