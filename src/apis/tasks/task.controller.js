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
        
        let subTask = []; 
        
        let results = await taskModel.aggregate([
            { $match: searchQuery },
            {
                $lookup: {
                    from: 'user_sub_tasks',
                    localField: '_id',
                    foreignField: 'task_id',
                    // let: { id: "$_id" },
                    // pipeline: [
                    //     {
                    //         $match: {
                    //         //$expr: { $eq: ["$_id", "$$task_id"] },
                    //         $expr: {
                    //             $and: [
                    //               { $eq: ["$task_id", "$$id"] },
                    //             ]
                    //         }
                    //       },
                    //     },
                    // ],
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
                    //"subtasks.updatedAt": false,
                    "subtasks.completionDate": false,
                    "subtasks.__v": false, 
                    "color.creationAt": false,
                    "color.updatedAt": false,
                    "color.__v": false,
                }
            }
        ])


        results.sort(function(a, b) {
            var keyA = a.orderSequence,
                keyB = b.orderSequence;
            // *Compare
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });
        
        results.map(async (result, index) => {
            result.subtasks.sort(function(a, b) {
                var keyA = a.orderSequence,
                  keyB = b.orderSequence;
                // *Compare
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            });
        })

        results.map(async (result, i) => {
            for (var i = result.subtasks.length - 1; i >= 0; i--) {
                if(result.subtasks[i].isCompleted === true){
                    let d = new Date(result.subtasks[i].updatedAt);
                    let updateAt = d.getFullYear() + '-' + (+d.getMonth() + 1) + '-' + d.getDate();

                    let date =  new Date();
                    let currentDate = date.getFullYear() + '-' + (+date.getMonth() + 1) + '-' + date.getDate();

                    if(currentDate > updateAt){
                        const index = result.subtasks.indexOf(result.subtasks[i]);
                        if (index > -1) {
                            result.subtasks.splice(index, 1);
                        }
                    }
                }
            }
        })

        return res.status(200).json({
            status: true,
            message: 'All Tasks',
            data: results
        })
    } catch (err) {
        console.log('file: task.controller.js => line 59 => getUserTasks => err', err);
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
        
        // *get count of same task
        let count = await taskModel.find({ user_id: req.user._id,title: req.body.title }).count()

        // *if task title exist then return
        if(count > 0){
            res.status(400).json({
                status: false,
                message: "Task Title Already Exist",
            })
        } else {

            // *check on same column no wise
            let isExist = await taskModel.find({ 
                user_id: req.user._id,
                column_no: req.body.columnNo,
            }).count()

            // *if exist then increment last order sequence by 1
            if(isExist > 0){
                let result = await taskModel.findOne({ 
                    user_id: req.user._id,
                    column_no: req.body.columnNo,
                }).sort({orderSequence:-1});    
                // *create obj for db insert            
                var obj = {
                    user_id: req.user._id,
                    title: req.body.title,
                    color: req.body.color,
                    column_no: req.body.columnNo,
                    orderSequence: +result.orderSequence + 1, // *add 1 in last order sequence number
                };
            } else {
                // *create obj for db insert
                var obj = {
                    user_id: req.user._id,
                    title: req.body.title,
                    color: req.body.color,
                    column_no: req.body.columnNo,
                    orderSequence: 1,
                };
            }

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

const swapTask = async (req, res) => {
    try {
        
        // *request body validation
        const validationRule = {
            'taskId': 'required',
            'columnNo': 'required',
            'newOrderSequence': 'required',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });

        // *check task belong to same previous column no
        let count = await taskModel.find({ 
            _id: req.body.taskId,
            column_no: req.body.columnNo
        }).count()

        let taskDetail = await taskModel.find({_id: req.body.taskId});
        let newOrderSequence = req.body.newOrderSequence;
        let currentOrderSequence = taskDetail[0].orderSequence;

        // *if belongs to same column
        if(count > 0){
            if(newOrderSequence < currentOrderSequence){

                let getInBetweenTasks = await taskModel.find({
                    user_id: req.user._id,
                    column_no: req.body.columnNo,
                    orderSequence: {
                        $gte: newOrderSequence,
                        $lt: currentOrderSequence
                    }
                })

                // *update obj
                let Obj = {
                    orderSequence: newOrderSequence,
                }

                // *update task model
                const updateTaskModel = await taskModel.findOneAndUpdate(
                    { _id: req.body.taskId }, 
                    { $set: Obj }
                )

                getInBetweenTasks.map(async (task, index) => {
                    let updateSequenceObj = {
                        orderSequence: +task.orderSequence + 1,
                    }
                    await taskModel.findOneAndUpdate(
                        { _id: task._id }, 
                        { $set: updateSequenceObj }
                    )
                })

            } else {
                let getInBetweenTasks = await taskModel.find({
                    user_id: req.user._id,
                    column_no: req.body.columnNo,
                    orderSequence: {
                        $gt: currentOrderSequence,
                        $lte: newOrderSequence
                    }
                })

                // *update obj
                let Obj = {
                    orderSequence: newOrderSequence,
                }

                // *update task model
                const updateTaskModel = await taskModel.findOneAndUpdate(
                    {_id: req.body.taskId }, 
                    { $set: Obj }
                )

                getInBetweenTasks.map(async (task, index) => {
                    let updateSequenceObj = {
                        orderSequence: +task.orderSequence - 1,
                    }
                    await taskModel.findOneAndUpdate(
                        { _id: task._id }, 
                        { $set: updateSequenceObj }
                    )
                })
            }
        } else {
            let getInBetweenTasks = await taskModel.find({
                user_id: req.user._id,
                column_no: req.body.columnNo,
                orderSequence: {
                    $gte: newOrderSequence
                }
            })

            getInBetweenTasks.map(async (task, index) => {
                let updateSequenceObj = {
                    orderSequence: +task.orderSequence + 1,
                }
                await taskModel.findOneAndUpdate(
                    { _id: task._id }, 
                    { $set: updateSequenceObj }
                )
            })

            // *create obj for db insert
            let obj = {
                user_id: req.user._id,
                title: taskDetail[0].title,
                color: taskDetail[0].color,
                column_no: req.body.columnNo,
                orderSequence: newOrderSequence,
            };

            // *insert
            const task = new taskModel(obj); 
            await task.save();

            // *get new id of task
            let getTaskId = await taskModel.find({
                user_id: req.user._id,
                column_no: req.body.columnNo,
                orderSequence: newOrderSequence
            })

            // *update obj
            let updateTaskId = {
                task_id: getTaskId[0]. _id,
            }
            await subTaskModel.updateMany(
                { task_id: req.body.taskId }, 
                { $set: updateTaskId }
            )

            let setTaskModelDeleteQuery = {
                _id: req.body.taskId
            };
            const deleteTaskModel = await taskModel.deleteOne( setTaskModelDeleteQuery );
        }

        res.status(200).json({
            status: true,
            message: 'success',
        })

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
    swapTask: swapTask,
    deleteTask: deleteTask,
    getUserTasks: getUserTasks,
    updateTaskTitle: updateTaskTitle,
}