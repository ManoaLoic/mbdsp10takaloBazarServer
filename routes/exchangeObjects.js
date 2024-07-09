const express = require( 'express');
const router = express.Router();
const ExchangeObjectController = require ('../controller/ExchangeObjectController');

router.get('/', ExchangeObjectController.getListeExchangeObjects);
router.post('/', ExchangeObjectController.addExchangeObject);
module.exports = router;

