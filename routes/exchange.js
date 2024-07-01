const express = require( 'express');
const router = express.Router();
 
const exchangeController = require('../controller/ExchangeController');

router.post('/proposed', exchangeController.proposerExchange);

module.exports = router;