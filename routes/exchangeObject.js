const express = require( 'express');
const router = express.Router();
const ExchangeObjectController = require ('../controller/ExchangeObjectController');

router.put('/:id', ExchangeObjectController.update);
router.delete('/:id', ExchangeObjectController.deleteExchangeObject);

module.exports = router;