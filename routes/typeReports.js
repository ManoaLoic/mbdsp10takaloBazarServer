const express = require( 'express');
const router = express.Router();
 
const TypeReportController = require('../controller/TypeReportController');

const { authorize } = require('../middleware/auth');

router.get('/', TypeReportController.getAllTypeReports);
router.post('/', authorize(['ADMIN']), TypeReportController.addTypeReport);
router.put('/:id', authorize(['ADMIN']), TypeReportController.updateTypeReport);

module.exports = router;