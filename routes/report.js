const express = require( 'express');
const router = express.Router();
 
const ReportController = require('../controller/ReportController');

router.post('/', ReportController.createReport);

module.exports = router;