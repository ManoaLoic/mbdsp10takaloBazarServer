const express = require( 'express');
const router = express.Router();
 
const exchangeController = require('../controller/ExchangeController');

router.get('/count', exchangeController.getCount);
module.exports = router;