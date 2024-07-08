const express = require('express');
const router = express.Router();
const categoryController = require ('../controller/CategoryController');

router.get('/', categoryController.getCategories);
router.put('/:id', categoryController.updateCategory);
router.post('/', categoryController.addCategory);
router.get('/statistics', categoryController.getCategoryStatistics);

module.exports = router;
