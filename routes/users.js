var express = require('express');
var router = express.Router();
const UserController = require('../controller/UserController');
const { authorize } = require('../middleware/auth');

router.get('', authorize(['ADMIN']), UserController.getAllUsers);
router.post('/add', authorize(['ADMIN']), UserController.addUser);

module.exports = router;
