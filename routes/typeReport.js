const express = require( 'express');
const router = express.Router();
 
const TypeReportController = require('../controller/TypeReportController');

router.delete('/:id', TypeReportController.deleteReportType);

module.exports = router;