'use strict';

let taskModel = require('./task.model');
let subTaskModel = require('../sub-tasks/sub-task.model');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');
var mongoose = require('mongoose');


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
                $lookup: {
                    from: 'colors',
                    localField: 'color',
                    foreignField: '_id',
                    as: 'color',
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
                    "color.creationAt": false,
                    "color.updatedAt": false,
                    "color.__v": false,
                }
            }
        
        ])

        return res.status(200).json({
            status: true,
            message: 'All Tasks',
            data: result
        })
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const addTask = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'title': 'required|string',
            'color': 'required|string',
            'columnNo': 'required',
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
            column_no: req.body.columnNo,
        };

        // *get count of same task
        let count = await taskModel.find({ user_id: req.user._id,title: req.body.title }).count()

        // *if task title exist then return
        if(count > 0){
            res.status(400).json({
                status: false,
                message: "Task Title Already Exist",
            })
        } else {
            // *insert
            const task = new taskModel(obj); 
            await task.save();
            
            res.status(200).json({
                status: true,
                message: "Task Created Successfully",
            })
        }
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const updateTaskTitle = async (req, res) => {
    try {
        
        // *request body validation
        const validationRule = {
            'id': 'required',
            'title': 'required',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });

        // *get count of same task
        let count = await taskModel.find({ user_id: req.user._id,title: req.body.title }).count()

        // *if task title exist then return
        if(count > 0){
            res.status(400).json({
                status: false,
                message: "Task Title Already Exist",
            })
        } else {
            let setTaskModelQuery = {
                title: req.body.title
            };
    
            // *update task title
            const updateTaskModel = await taskModel.findOneAndUpdate(
                { _id: req.body.id }, 
                { $set: setTaskModelQuery }
            )
    
            if(!updateTaskModel){
                return res.status(500).json({ 
                    status: false,
                    message: "Unexpected error" 
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: "Title Updated Successfully",
                })
            }
        }

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const deleteTask = async (req, res) => {
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

        let setTaskModelQuery = {
            _id: req.body.id
        };
        
        let setSubTaskModelQuery = {
            task_id: req.body.id
        };

        // *delete task
        const deleteTaskModel = await taskModel.deleteOne( setTaskModelQuery );
        const deleteSubTaskModel = await subTaskModel.deleteMany( setSubTaskModelQuery );

        if(!deleteSubTaskModel){
            return res.status(500).json({ 
                status: false,
                message: "Unexpected error" 
            });
        } else {
            return res.status(200).json({
                status: true,
                message: "Task Deleted Successfully",
            })
        }

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    addTask: addTask,
    deleteTask: deleteTask,
    getUserTasks: getUserTasks,
    updateTaskTitle: updateTaskTitle,
}