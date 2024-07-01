const express = require( 'express');
const router = express.Router();
 
const TypeReportController = require('../controller/TypeReportController');

router.post('/', TypeReportController.addTypeReport);

module.exports = router;