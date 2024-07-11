var express = require('express');
var router = express.Router();
const UserController = require('../controller/UserController');
// 
router.put('/:id', UserController.userUpdate);
router.get('/',UserController.getUserProfile);
router.get('/:userId/objects', UserController.getUserObjects);
router.delete('/:id', UserController.userRemove);
module.exports = router;
