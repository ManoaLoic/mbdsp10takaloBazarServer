const express = require( 'express');
const router = express.Router();
 
const TypeReportController = require('../controller/TypeReportController');

const { authorize, authenticate } = require('../middleware/auth');

router.get('/', TypeReportController.getAllTypeReports);
router.post('/', authenticate, authorize(['ADMIN']), TypeReportController.addTypeReport);
router.put('/:id', authenticate, authorize(['ADMIN']), TypeReportController.updateTypeReport);

module.exports = router;