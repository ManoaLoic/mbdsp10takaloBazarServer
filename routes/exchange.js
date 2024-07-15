const express = require( 'express');
const router = express.Router();
 
const exchangeController = require('../controller/ExchangeController');
const { authorize } = require('../middleware/auth');

router.post('/proposed', authorize(['USER']), exchangeController.proposerExchange);
router.get('/history/:userId', authorize(['USER']), exchangeController.getHistoriqueExchange);
router.patch('/:exchangeId/reject', authorize(['USER']), exchangeController.rejectExchange);
router.patch('/:exchangeId/accept', authorize(['USER']), exchangeController.acceptExchange);

module.exports = router;