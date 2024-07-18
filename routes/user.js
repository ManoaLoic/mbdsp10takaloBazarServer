var express = require('express');
var router = express.Router();
const UserController = require('../controller/UserController');
// 

const { authorize } = require('../middleware/auth');

router.put('/:id', UserController.userUpdate);
router.get('/:id',UserController.getUserProfile);
router.get('/:userId/objects', UserController.getUserObjects);
router.delete('/:id', authorize(['ADMIN']), UserController.userRemove);
module.exports = router;
