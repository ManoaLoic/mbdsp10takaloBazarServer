const express = require( 'express');
const router = express.Router();
 
const userController = require('../controller/UserController');

router.post('/user/login', userController.loginUser);
module.exports = router;