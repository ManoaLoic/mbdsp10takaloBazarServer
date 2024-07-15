const express = require( 'express');
const router = express.Router();
 
const ReportController = require('../controller/ReportController');

const { authorize } = require('../middleware/auth');

router.post('/', authorize(['USER']), ReportController.createReport);
router.get('/', authorize(['ADMIN']), ReportController.listReportedObjects);

module.exports = router;