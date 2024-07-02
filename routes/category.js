const express = require('express');
const router = express.Router();
const categoryRepository = require('../service/CategoryRepository');
const categoryController = require ('../controller/CategoryController');

router.get('/', categoryController.getCategories);
router.put('/:id', categoryController.updateCategory);
router.post('/', categoryController.addCategory);

module.exports = router;
