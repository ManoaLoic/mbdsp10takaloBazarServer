const { expressjwt: jwt } = require('express-jwt');
const jwt_decode = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const revokedTokens = new Set();

const authenticate = jwt({
    secret: secretKey,
    algorithms: ['HS256'],
    requestProperty: 'user',
    isRevoked: (req, token) => {
        const jti = token.payload.jti;
        return revokedTokens.has(jti);
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
