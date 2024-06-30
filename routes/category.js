const express = require('express');
const router = express.Router();
const categoryRepository = require('../service/CategoryRepository');

router.get('/', async (req, res) => {
    try {
        const categories = await categoryRepository.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error });
    }
});

module.exports = router;
