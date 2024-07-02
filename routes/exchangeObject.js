const express = require( 'express');
const router = express.Router();
const ExchangeObjectController = require ('../controller/ExchangeObjectController');

router.get('/', ExchangeObjectController.getListeExchangeObjects);
module.exports = router;

