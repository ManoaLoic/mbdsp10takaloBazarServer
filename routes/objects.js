const express = require( 'express');
const router = express.Router();
 
const ObjectController = require('../controller/ObjectController');

router.get('/', ObjectController.getObjects);
router.patch('/:objectId/remove', ObjectController.removeObject);
router.put('/:id', ObjectController.updateObject);

module.exports = router;