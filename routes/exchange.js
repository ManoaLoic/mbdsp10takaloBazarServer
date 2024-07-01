const express = require( 'express');
const router = express.Router();
 
const exchangeController = require('../controller/ExchangeController');

router.post('/proposed', exchangeController.proposerExchange);
router.get('/history/:userId', exchangeController.getHistoriqueExchange);
module.exports = router;