const { expressjwt: jwt } = require('express-jwt');
const jwt_decode = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const revokedTokens = new Set();

const jwtMiddleware = (required = true) => {
    return (req, res, next) => {
        const token = req.headers['authorization'];
        if (token) {
            jwt({
                secret: secretKey,
                algorithms: ['HS256'],
                requestProperty: 'user',
                isRevoked: (req, token) => {
                    const jti = token.payload.jti;
                    return revokedTokens.has(jti);
                }
            })(req, res, (err) => {
                if (err && required) {
                    return res.status(401).send('Unauthorized');
                }
                next();
            });
        } else if (required) {
            return res.status(401).send('Unauthorized');
        } else {
            next();
        }
    };
};

const authenticate = jwtMiddleware(true);
const optionalAuthenticate = jwtMiddleware(false);

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
    revokedTokens,
    optionalAuthenticate
};
