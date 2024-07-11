const express = require( 'express');
const router = express.Router();
const { authenticate, revokedTokens } = require('../middleware/auth');
const userController = require('../controller/UserController');
const jwt = require('jsonwebtoken');
const RevokedToken = require('../models/RevokedToken');

router.post('/user/login', userController.loginUser);
router.post('/admin/login', userController.loginAdmin);
router.post('/logout', authenticate, async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.decode(token);
    console.log("TOOO : ",jwt.decode(token));
    if (!decodedToken || !decodedToken.jti) {
        console.error('Invalid token:', decodedToken);
        return res.status(400).json({ message: 'Invalid token' });
    }
    try {
        console.log('Revoking token with jti:', decodedToken.jti);
        await RevokedToken.create({ jti: decodedToken.jti });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Error revoking token:', err);
        res.status(500).json({ message: 'Error during logout' });
    }
});

module.exports = router;