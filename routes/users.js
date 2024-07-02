var express = require('express');
var router = express.Router();
const UserController = require('../controller/UserController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/:userId',UserController.getUserProfile);

module.exports = router;
