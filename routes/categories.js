const express = require('express');
const router = express.Router();
const categoryController = require ('../controller/CategoryController');
const { authorize, authenticate } = require('../middleware/auth');

router.get('/', categoryController.getCategories);
router.put('/:id', authenticate, authorize(['ADMIN']), categoryController.updateCategory);
router.post('/', authenticate, authorize(['ADMIN']), categoryController.addCategory);
router.get('/statistics', authenticate, authorize(['ADMIN']), categoryController.getCategoryStatistics);

module.exports = router;
