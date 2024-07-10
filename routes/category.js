const express = require('express');
const router = express.Router();
const categoryController = require ('../controller/CategoryController');
const { authorize } = require('../middleware/auth');

router.delete('/:id', authorize(['ADMIN']), categoryController.deleteCategory);

module.exports = router;
