const service = require('../services/jwt.service');
const userModel = require('../apis/users/user.model');

module.exports = {
    validate: async (req, res, next) => {
        // *get the token from the header if present
        try {
            let token = req.headers['x-access-token'] || req.headers.authorization;

            // *if no token found, return response (without going to the next middleware)
            if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

            if (token.startsWith('Bearer ')) {
                // *Remove Bearer from string
                token = token.slice(7, token.length);

                const decoded = await service.verifyToken(token);

                // *check if user subscription plan is active     
                if (!decoded.plan_active && !req.originalUrl.includes("plans") && !req.originalUrl.includes("getUserDetails"))  return res.status(401).json({ message: 'User Membership Expired.' });
                // *if can verify the token, set req.user and pass to next middleware
                let result = await userModel.findOne({
                    _id: decoded.id
                }, { 'reset_expiry': 0 });

                if (result) {
                    req.user = result;
                    return next();
                }
            }
            return res.status(401).json({ message: 'Invalid token.' });
        } catch (ex) {
            // *if invalid token
            return res.status(401).json({ message: 'Invalid token.' });
        }
    },
}
