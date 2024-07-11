var express = require('express');
var router = express.Router();
const UserController = require('../controller/UserController');
// 
router.put('/:id', UserController.userUpdate);
router.get('/:userId',UserController.getUserProfile);
router.get('/:userId/objects', UserController.getUserObjects);

module.exports = router;
