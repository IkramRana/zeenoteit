'use strict';

let express = require('express');
let quoteCtrl = require('./quote.controller');
let auth = require('../../services/auth.service')
let router = express.Router();


// *Prefix Path --- '/api/quote'

//post
router.post('/add-quote', auth.validate, quoteCtrl.addQuote);

module.exports = router;