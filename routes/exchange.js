const express = require( 'express');
const router = express.Router();
 
const exchangeController = require('../controller/ExchangeController');

router.post('/proposed', exchangeController.proposerExchange);
router.get('/history/:userId', exchangeController.getHistoriqueExchange);
router.patch('/:exchangeId/reject', exchangeController.rejectExchange);
router.patch('/:exchangeId/accept', exchangeController.acceptExchange);

module.exports = router;