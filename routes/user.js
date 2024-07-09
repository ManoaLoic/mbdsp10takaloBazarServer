var express = require('express');
var router = express.Router();
const UserController = require('../controller/UserController');
// 
router.put('/:id', UserController.userUpdate);

module.exports = router;
