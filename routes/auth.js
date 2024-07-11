const express = require( 'express');
const router = express.Router();
const { authenticate, revokedTokens } = require('../middleware/auth');
const userController = require('../controller/UserController');
const jwt = require('jsonwebtoken');

router.post('/user/login', userController.loginUser);
router.post('/admin/login', userController.loginAdmin);
router.post('/logout', authenticate, (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.decode(token);
    revokedTokens.add(decodedToken.jti);
    res.status(200).json({ message: 'Logged out successfully' });
});
module.exports = router;