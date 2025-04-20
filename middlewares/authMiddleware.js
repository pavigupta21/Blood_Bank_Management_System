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

module.exports = authenticateUser;