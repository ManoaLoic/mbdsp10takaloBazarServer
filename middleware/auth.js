const { expressjwt: jwt } = require('express-jwt');

const secretKey = process.env.SECRET_KEY;

const authenticate = jwt({
    secret: secretKey,
    algorithms: ['HS256'],
    requestProperty: 'user',
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
};
