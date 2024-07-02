const express = require( 'express');
const router = express.Router();
 
const userController = require('../controller/UserController');

router.post('/', userController.register);
module.exports = router;