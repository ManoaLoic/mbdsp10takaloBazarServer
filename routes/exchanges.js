const express = require( 'express');
const router = express.Router();
 
const exchangeController = require('../controller/ExchangeController');
const { authorize } = require('../middleware/auth');

router.get('/', authorize(['ADMIN']), exchangeController.getExchanges);
router.get('/count', authorize(['ADMIN']), exchangeController.getCount);
router.get('/myCurrents', authorize(['USER']), exchangeController.getOpenExchanges);
router.get('/top-users', authorize(['ADMIN']), exchangeController.getTopUsersByExchanges);
router.get('/dashboard', authorize(['ADMIN']), exchangeController.getExchangesBetweenDates);
module.exports = router;