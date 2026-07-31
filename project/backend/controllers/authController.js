// filepath: project/backend/controllers/authController.js
// Controleur d'authentification - Logique metier

const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../services/emailService');

const resetTokens = {};
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const getClientUrl = (req) => {
    return process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:3000';
};

const formatUser = (user) => ({
    id: user.id_utilisateur,
    nom: user.nom_utilisateur,
    prenom: user.prenom_utilisateur,
    email: user.email,
    role: user.Role,
    actif: Boolean(user.actif),
    dateCreation: user.Date_creation || null,
});

const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET manquant dans la configuration');
    }

    return jwt.sign(
        {
            id: user.id_utilisateur,
            email: user.email,
            role: user.Role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
};

const register = async (req, res) => {
    try {
        const { prenom, nom, email, mot_de_passe, id_utilisateur } = req.body;

        if (id_utilisateur) {
            return res.status(400).json({ message: 'id_utilisateur est auto-genere et ne peut pas etre fourni' });
        }

        if (!prenom || !nom || !email || !mot_de_passe) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Veuillez saisir une adresse email valide' });
        }

        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email deja utilise' });
        }

        const newUser = await User.createUser({ nom, prenom, email, mot_de_passe, Role: 'utilisateur' });

        res.status(201).json({
            message: 'Inscription reussie',
            user: formatUser(newUser),
            token: generateToken(newUser),
        });
    } catch (error) {
        console.error('Erreur register:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        if (!email || !mot_de_passe) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        const user = await User.findUserByEmail(email);
        if (!user || user.mot_de_passe !== mot_de_passe) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        if (!user.actif) {
            return res.status(403).json({ message: 'Ce compte est désactivé. Contactez un administrateur.' });
        }

        res.json({
            message: 'Connexion reussie',
            user: formatUser(user),
            token: generateToken(user),
        });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Veuillez saisir une adresse email valide' });
        }

        const user = await User.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable dans la plateforme' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        resetTokens[email] = {
            tokenHash: hashToken(token),
            expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
        };

        const params = new URLSearchParams({ email, token });
        const resetLink = `${getClientUrl(req)}/reset-password?${params.toString()}`;

        await sendPasswordResetEmail({ to: email, resetLink });

        res.json({
            message: 'Un lien de réinitialisation a été envoyé a votre adresse email.',
        });
    } catch (error) {
        console.error('Erreur forgotPassword:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const { token, mot_de_passe } = req.body;

        if (!isValidEmail(email) || !token || !mot_de_passe) {
            return res.status(400).json({ message: 'Lien de reinitialisation invalide ou mot de passe manquant' });
        }

        if (String(mot_de_passe).length < 6) {
            return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caracteres' });
        }

        const storedToken = resetTokens[email];
        if (!storedToken || storedToken.tokenHash !== hashToken(token)) {
            return res.status(400).json({ message: 'Lien de reinitialisation invalide' });
        }

        if (Date.now() > storedToken.expiresAt) {
            delete resetTokens[email];
            return res.status(400).json({ message: 'Lien de reinitialisation expire' });
        }

        const user = await User.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        await User.updateUser(user.id_utilisateur, user.nom_utilisateur, user.prenom_utilisateur, user.email, mot_de_passe);
        delete resetTokens[email];

        res.json({ message: 'Mot de passe reinitialise avec succes. Vous pouvez vous connecter.' });
    } catch (error) {
        console.error('Erreur resetPassword:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findUserById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouve' });
        }

        res.json({ user: formatUser(user) });
    } catch (error) {
        console.error('Erreur getProfile:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { nom, prenom, email, mot_de_passe, id_utilisateur, Date_creation } = req.body;

        if (id_utilisateur || Date_creation) {
            return res.status(400).json({ message: 'id_utilisateur et Date_creation ne peuvent pas etre modifies' });
        }

        if (!nom || !prenom || !email) {
            return res.status(400).json({ message: 'Nom, prenom et email requis' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Veuillez saisir une adresse email valide' });
        }

        const existingUser = await User.findUserByEmail(email);
        if (existingUser && existingUser.id_utilisateur !== userId) {
            return res.status(400).json({ message: 'Email deja utilise' });
        }

        await User.updateUser(userId, nom, prenom, email, mot_de_passe);
        const updatedUser = await User.findUserById(userId);

        res.json({
            message: 'Profil mis a jour',
            user: formatUser(updatedUser),
        });
    } catch (error) {
        console.error('Erreur updateProfile:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
};
