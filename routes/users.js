var express = require('express');
var router = express.Router();
const UserController = require('../controller/UserController');

router.get('',UserController.getAllUsers);

module.exports = router;
