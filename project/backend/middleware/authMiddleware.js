const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ message: 'Token d authentification requis' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Configuration JWT manquante' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        const message = error.name === 'TokenExpiredError'
            ? 'Token expire. Veuillez vous reconnecter.'
            : 'Token invalide. Veuillez vous reconnecter.';
        return res.status(401).json({ message });
    }

    try {
        const userId = Number(decoded.id);
        if (!userId) {
            return res.status(401).json({ message: 'Token invalide: utilisateur manquant' });
        }

        const user = await User.findUserById(userId);
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur introuvable' });
        }

        if (!user.actif) {
            return res.status(403).json({ message: 'Ce compte est désactivé. Contactez un administrateur.' });
        }

        req.userId = userId;
        req.user = { ...user, role: user.Role };
        next();
    } catch (error) {
        console.error('Erreur authenticateToken:', error);
        return res.status(500).json({ message: error.message || 'Erreur serveur authentification' });
    }
};

module.exports = {
    authenticateToken,
};
