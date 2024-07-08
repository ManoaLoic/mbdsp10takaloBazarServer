const express = require( 'express');
const router = express.Router();
 
const userController = require('../controller/UserController');

router.post('/user/login', userController.loginUser);
router.post('/admin/login', userController.loginAdmin);

module.exports = router;