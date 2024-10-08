const express = require( 'express');
const router = express.Router();
 
const ReportController = require('../controller/ReportController');

router.get('/:id', ReportController.getReport);

module.exports = router;