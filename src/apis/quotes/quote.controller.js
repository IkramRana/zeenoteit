'use strict';

let quoteModel = require('./quote.model');
var { validator } = require('../../util/helper');
var errorHandler = require('../../util/errorHandler');
//const excelToJson = require('convert-excel-to-json');
const csv=require('csvtojson')
var mongoose = require('mongoose');


const getQuote = async (req, res) => {
    try {

        let now = new Date();
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = now - start;
        let oneDay = 1000 * 60 * 60 * 24;
        let day = Math.floor(diff / oneDay);

        let result = await quoteModel.find({ day_no: +day }, { _id:0,day_no:0,creationAt:0,updatedAt:0,__v: 0 });

        return res.status(200).json({
            status: true,
            message: 'User Quote',
            data: result
        })
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const addQuote = async (req, res) => {
    try {
        // *request body validation
        const validationRule = {
            'dayNo': 'required',
            'quote': 'required|string',
            'sponsor': 'required|string',
            'author': 'required|string',
        }
    
        validator(req.body, validationRule, {}, (err, status) => {
            if (!status) {
                return res.status(412).json({
                    status: false, responseCode: 412,
                    message: 'Validation failed', data: err
                })
            }
        });
        
        // *create insert obj for db insert
        let insertObj = {
            day_no: req.body.dayNo,
            quote: req.body.quote,
            sponsor: req.body.sponsor,
            author: req.body.author,
        };
        
        // *insert
        const quote = new quoteModel(insertObj); 
        await quote.save();

        res.status(200).json({
            status: true,
            message: "Quote Added Successfully",
        })
    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

const csvUpload = async (req, res) => {
    try {

        let originalName = req.file.originalname;
        let splitOriginalName = originalName.split('.');
        let extension = splitOriginalName[1];
        
        if(extension !== 'csv'){
            res.status(400).json({
                status: false,
                message: 'Only csv file allowed!',
            })
        }

        let quotes = [];

        const csvFilePath=req.file.path;
        await csv({
            noheader:true,
            output: "csv"
        })
        .fromFile(csvFilePath)
        .then((jsonObj)=>{
            for (let index = 0; index < jsonObj.length; index++) {
                quotes.push({
                    day_no: +jsonObj[index][0],
                    quote: jsonObj[index][1],
                    sponsor: jsonObj[index][2],
                    author: jsonObj[index][3],
                })
            }
        })
        
        // *insert many
        await quoteModel.insertMany(quotes); 

        res.status(200).json({
            status: true,
            message: 'csv uploaded successfully',
        })

    } catch (err) {
        let error = errorHandler.handle(err)
        return res.status(500).json(error)
    }
}

module.exports = {
    getQuote: getQuote,
    addQuote: addQuote,
    csvUpload: csvUpload,
}