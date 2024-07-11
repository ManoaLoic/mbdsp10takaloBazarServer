const { expressjwt: jwt } = require('express-jwt');
const jwt_decode = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const revokedTokens = new Set();
const RevokedToken = require('../models/RevokedToken');

const authenticate = jwt({
    secret: secretKey,
    algorithms: ['HS256'],
    requestProperty: 'user',
    isRevoked: async (req, token) => {
        const jti = token.payload.jti;
        const revokedToken = await RevokedToken.findByPk(jti);
        return !!revokedToken;
    }
});

const authorize = (roles) => (req, res, next) => {
    const { type } = req.user;
    if (!roles.includes(type)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

module.exports = {
    authenticate,
    authorize,
    revokedTokens
};
