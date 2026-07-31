const isAdminUser = (user) => user?.Role === 'admin' || user?.role === 'admin';

const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentification requise' });
    }

    if (!isAdminUser(req.user)) {
        return res.status(403).json({ message: 'Acces reserve aux administrateurs' });
    }

    return next();
};

module.exports = {
    requireAdmin,
    isAdminUser,
};
