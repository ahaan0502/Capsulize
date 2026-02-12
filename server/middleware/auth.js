const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        //Get token from header
        const token = req.header('Authorization')?.replace('Bearer', '');

        if (!token) {
            return res.status(401).json({error: 'No authentication token, access denied'});
        }

        //Verify token
        const decoded = jwt.verify(token, process.env.JWTSECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({error: 'Invalid token'});
    }
};

module.exports = authenticate;