'use strict';

let subTaskModel = require('./sub-task.model');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');
var mongoose = require('mongoose');
const { LoopDetected } = require('http-errors');

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
            title: req.body.title,
            isCompleted: false 
        }).count()
        console.log('file: sub-task.controller.js => line 33 => addSubTask => count', count);

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
            const subTask = new subTaskModel(obj); 
            await subTask.save();

            res.status(200).json({
                message: "Sub Task Created Successfully",
            })
        }
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const getUserSubTaskByTaskId = async (req, res) => {
    try {
    
        const subTasks = await subTaskModel.find(
            {
                task_id : req.query.id
            },
            { 
                user_id:0,
                creationAt:0,
                //updatedAt:0,
                __v: 0 
            }
        ).sort({orderSequence:1});

        for (var i = subTasks.length - 1; i >= 0; i--) {
            if(subTasks[i].isCompleted === true){
                let d = new Date(subTasks[i].updatedAt);
                let updateAt = d.getFullYear() + '-' + (+d.getMonth() + 1) + '-' + d.getDate();

                let date =  new Date();
                let currentDate = date.getFullYear() + '-' + (+date.getMonth() + 1) + '-' + date.getDate();

                if(currentDate > updateAt){
                    const index = subTasks.indexOf(subTasks[i]);
                    if (index > -1) {
                        subTasks.splice(index, 1);
                    }
                }
            }
        }

        res.status(200).json({
            status: true,
            message: 'Sub Tasks',
            data: subTasks
        })

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const swapSubTask = async (req, res) => {
    try {

        // *request body validation
        const validationRule = {
            'taskId': 'required',
            'subtaskId': 'required',
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

        // *check subtask belong to same previous parent task
        let count = await subTaskModel.find({ 
            _id: req.body.subtaskId,
            task_id: req.body.taskId
        }).count()

        let subTaskDetail = await subTaskModel.find({_id: req.body.subtaskId});
        let newOrderSequence = req.body.newOrderSequence;
        let currentOrderSequence = subTaskDetail[0].orderSequence;

        // *if exist
        if(count > 0){
            if(newOrderSequence < currentOrderSequence){

                let getInBetweenSubTasks = await subTaskModel.find({
                    task_id: req.body.taskId,
                    orderSequence: {
                        $gte: newOrderSequence,
                        $lt: currentOrderSequence
                    }
                })

                // *update obj
                let Obj = {
                    orderSequence: newOrderSequence,
                }

                // *update subtask model
                const updateSubTaskModel = await subTaskModel.findOneAndUpdate(
                    { _id: req.body.subtaskId }, 
                    { $set: Obj }
                )

                getInBetweenSubTasks.map(async (subTask, index) => {
                    let updateSequenceObj = {
                        orderSequence: +subTask.orderSequence + 1,
                    }
                    await subTaskModel.findOneAndUpdate(
                        { _id: subTask._id }, 
                        { $set: updateSequenceObj }
                    )
                })

            } else {
                let getInBetweenSubTasks = await subTaskModel.find({
                    task_id: req.body.taskId,
                    orderSequence: {
                        $gt: currentOrderSequence,
                        $lte: newOrderSequence
                    }
                })

                // *update obj
                let Obj = {
                    orderSequence: newOrderSequence,
                }

                // *update subtask model
                const updateSubTaskModel = await subTaskModel.findOneAndUpdate(
                    { _id: req.body.subtaskId }, 
                    { $set: Obj }
                )

                getInBetweenSubTasks.map(async (subTask, index) => {
                    let updateSequenceObj = {
                        orderSequence: +subTask.orderSequence - 1,
                    }
                    await subTaskModel.findOneAndUpdate(
                        { _id: subTask._id }, 
                        { $set: updateSequenceObj }
                    )
                })
            }
        } else {
            let getInBetweenSubTasks = await subTaskModel.find({
                task_id: req.body.taskId,
                orderSequence: {
                    $gte: newOrderSequence
                }
            })

            getInBetweenSubTasks.map(async (subTask, index) => {
                let updateSequenceObj = {
                    orderSequence: +subTask.orderSequence + 1,
                }
                await subTaskModel.findOneAndUpdate(
                    { _id: subTask._id }, 
                    { $set: updateSequenceObj }
                )
            })

            // *create obj for db insert
            let obj = {
                user_id: req.user._id,
                task_id: req.body.taskId,
                title: subTaskDetail[0].title,
                orderSequence: newOrderSequence,
            };

            // *insert
            const task = new subTaskModel(obj); 
            await task.save();

            let setSubTaskModelDeleteQuery = {
                _id: req.body.subtaskId
            };
            const deleteSubTaskModel = await subTaskModel.deleteOne( setSubTaskModelDeleteQuery );
        }
        
        res.status(200).json({
            status: true,
            message: 'Sub Task Swap Successfully',
        })

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const checkUncheckSubtask = async (req, res) => {
    try {
        
        // *request body validation
        const validationRule = {
            'id': 'required',
            'status': 'required',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });

        let date = new Date();
        let completionDate = req.body.status === true ? date : null;

        let setSubTaskModelQuery = {
            isCompleted: req.body.status,
            completionDate: completionDate,
            updatedAt: date
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
                message: "Sub Task Updated Successfully",
            })
        }

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const deleteSubTask = async (req, res) => {
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
            _id: req.body.id
        };

        // *delete sub task
        const deleteSubTaskModel = await subTaskModel.deleteMany( setSubTaskModelQuery );

        if(!deleteSubTaskModel){
            return res.status(500).json({ 
                status: false,
                message: "Unexpected error" 
            });
        } else {
            return res.status(200).json({
                status: true,
                message: "Sub Task Deleted Successfully",
            })
        }

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    addSubTask: addSubTask,
    swapSubTask: swapSubTask,
    deleteSubTask: deleteSubTask,
    checkUncheckSubtask: checkUncheckSubtask,
    getUserSubTaskByTaskId: getUserSubTaskByTaskId,
}