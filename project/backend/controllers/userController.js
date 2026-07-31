const User = require('../models/User');

const allowedRoles = ['utilisateur', 'admin'];
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

const formatUser = (user) => ({
    id: user.id_utilisateur,
    prenom: user.prenom_utilisateur,
    nom: user.nom_utilisateur,
    email: user.email,
    role: user.Role,
    actif: Boolean(user.actif),
    dateCreation: user.Date_creation || null,
});

const getUsers = async (req, res) => {
    try {
        const allUsers = await User.getAllUsers();
        res.json({ users: allUsers.map(formatUser) });
    } catch (error) {
        console.error('Erreur getUsers:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const createUser = async (req, res) => {
    try {
        const { prenom, nom, email, role, mot_de_passe, id_utilisateur } = req.body;

        if (id_utilisateur) {
            return res.status(400).json({ message: 'id_utilisateur est auto-genere et ne peut pas etre fourni' });
        }

        if (!prenom || !nom || !email || !role || !mot_de_passe) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Veuillez saisir une adresse email valide' });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Role invalide' });
        }

        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email deja utilise' });
        }

        const newUser = await User.createUser({ nom, prenom, email, mot_de_passe, Role: role });
        res.status(201).json({ user: formatUser(newUser) });
    } catch (error) {
        console.error('Erreur createUser:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const updateUserController = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const { prenom, nom, email, role, mot_de_passe, id_utilisateur, Date_creation } = req.body;

        if (id_utilisateur || Date_creation) {
            return res.status(400).json({ message: 'id_utilisateur et Date_creation ne peuvent pas etre modifies' });
        }

        if (!prenom || !nom || !email || !role) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Veuillez saisir une adresse email valide' });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Role invalide' });
        }

        const existingUser = await User.findUserByEmail(email);
        if (existingUser && existingUser.id_utilisateur !== userId) {
            return res.status(400).json({ message: 'Email deja utilise' });
        }

        await User.updateUser(userId, nom, prenom, email, mot_de_passe);
        await User.updateUserRole(userId, role);
        const updatedUser = await User.findUserById(userId);
        res.json({ user: formatUser(updatedUser) });
    } catch (error) {
        console.error('Erreur updateUserController:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const updateUserStatusController = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        if (!userId) {
            return res.status(400).json({ message: 'ID utilisateur invalide' });
        }

        if (typeof req.body.actif !== 'boolean') {
            return res.status(400).json({ message: 'Le statut actif doit être un booléen' });
        }

        if (req.userId === userId && !req.body.actif) {
            return res.status(400).json({ message: 'Vous ne pouvez pas désactiver votre propre compte.' });
        }

        const result = await User.updateUserStatus(userId, req.body.actif);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        const updatedUser = await User.findUserById(userId);
        res.json({
            message: req.body.actif ? 'Compte activé' : 'Compte désactivé',
            user: formatUser(updatedUser),
        });
    } catch (error) {
        console.error('Erreur updateUserStatusController:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUserController,
    updateUserStatusController,
};
