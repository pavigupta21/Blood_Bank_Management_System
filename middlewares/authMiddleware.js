const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/signup?error=Please signup or login to access this page');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Invalid token:", err);
        res.clearCookie('token');
        return res.redirect('/signup?error=Session expired. Please login again');
    }
};

const authorizeRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.redirect('/signup?error=Forbidden: You do not have permission to access this resource');
        }
        next();
    };
};

module.exports = {authenticateUser, authorizeRole};