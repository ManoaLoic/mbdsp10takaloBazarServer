const express = require( 'express');
const router = express.Router();
 
const TypeReportController = require('../controller/TypeReportController');

router.post('/', TypeReportController.addTypeReport);
router.put('/:id',TypeReportController.updateTypeReport);

module.exports = router;