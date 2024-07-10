const express = require('express');
const router = express.Router();
const categoryController = require ('../controller/CategoryController');
const { authorize } = require('../middleware/auth');

router.get('/', categoryController.getCategories);
router.put('/:id', authorize(['ADMIN']), categoryController.updateCategory);
router.post('/', authorize(['ADMIN']), categoryController.addCategory);
router.get('/statistics', authorize(['ADMIN']), categoryController.getCategoryStatistics);

module.exports = router;
