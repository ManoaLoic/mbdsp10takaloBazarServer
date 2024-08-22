const express = require( 'express');
const router = express.Router();
const { authenticate, revokedTokens } = require('../middleware/auth');
const userController = require('../controller/UserController');
const jwt = require('jsonwebtoken');
const DeviceSchemaRepository = require("../service/FireBaseService/DeviceService");

router.post('/user/login', userController.loginUser);
router.post('/admin/login', userController.loginAdmin);
router.post('/logout', authenticate, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decode(token);
        revokedTokens.add(decodedToken.jti);
        await DeviceSchemaRepository.deleteDevicesByUserID(decodedToken.id);
        res.status(200).json({ message: 'Déconnecté avec succès' });
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
});
module.exports = router;