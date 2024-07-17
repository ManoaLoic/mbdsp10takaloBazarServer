const express = require('express');
const router = express.Router();
const { optionalAuthenticate, authenticate, authorize } = require('../middleware/auth');
const ObjectController = require('../controller/ObjectController');

router.get('/', optionalAuthenticate, ObjectController.getObjects);
router.put('/:id', authenticate, authorize(['USER', 'ADMIN']), ObjectController.updateObject);
router.post('/', authenticate, authorize(['USER', 'ADMIN']), ObjectController.createObject);

module.exports = router;