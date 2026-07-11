const role = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden access'
            });
        }
        return next();
    };
};

module.exports = role;

