const express = require('express');
const router = express.Router();
const categoryController = require ('../controller/CategoryController');

router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
