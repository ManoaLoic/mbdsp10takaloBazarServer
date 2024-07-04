const express = require( 'express');
const router = express.Router();
 
const ObjectController = require('../controller/ObjectController');
const upload = require('../config/upload');

router.get('/', ObjectController.getObjects);
router.put('/:id', ObjectController.updateObject);
router.post('/', upload.single('image'), ObjectController.createObject);

module.exports = router;