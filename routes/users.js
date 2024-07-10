var express = require('express');
var router = express.Router();
const UserController = require('../controller/UserController');

router.get('',UserController.getAllUsers);
router.post('/add',UserController.addUser);

module.exports = router;
