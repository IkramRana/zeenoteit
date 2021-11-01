'use strict';

let express = require('express');
let countryCtrl = require('./country.controller');
const upload = require('../../services/imageUpload.service');
let router = express.Router();


// *Prefix Path --- '/api/country'

//post
router.post('/add-country', upload.uploadImg, countryCtrl.addCountry);

module.exports = router;