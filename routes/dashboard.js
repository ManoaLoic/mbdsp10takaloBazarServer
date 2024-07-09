const express = require('express');
const router = express.Router();
const DashboardController = require('../controller/DashboardController');

router.get('/', DashboardController.getStatistics);

module.exports = router;