const express = require( 'express');
const router = express.Router();
 
const ReportController = require('../controller/ReportController');

router.post('/', ReportController.createReport);
router.get('/', ReportController.listReportedObjects);

module.exports = router;