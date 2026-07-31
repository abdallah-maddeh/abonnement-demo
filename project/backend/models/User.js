// filepath: project/backend/models/User.js
// Modele User - Gestion des donnees utilisateur MySQL

const db = require('../config/db');

const userSelect = `
    id_utilisateur,
    nom_utilisateur,
    \`prénom_utilisateur\` AS prenom_utilisateur,
    email,
    mot_de_passe,
    Role,
    actif,
    \`Date_création\` AS Date_creation
`;

const publicUserSelect = `
    id_utilisateur,
    nom_utilisateur,
    \`prénom_utilisateur\` AS prenom_utilisateur,
    email,
    Role,
    actif,
    \`Date_création\` AS Date_creation
`;

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

const ensureAccountStatusColumn = async () => {
    const columns = await query("SHOW COLUMNS FROM utilisateurs LIKE 'actif'");
    if (columns.length === 0) {
        await query('ALTER TABLE utilisateurs ADD COLUMN actif TINYINT(1) NOT NULL DEFAULT 1');
    }
};

const findUserByEmail = async (email) => {
    const rows = await query(`SELECT ${userSelect} FROM utilisateurs WHERE email = ?`, [email]);
    return rows[0];
};

const findUserById = async (id) => {
    const rows = await query(`SELECT ${publicUserSelect} FROM utilisateurs WHERE id_utilisateur = ?`, [id]);
    return rows[0];
};

const getAllUsers = async () => {
    return query(`SELECT ${publicUserSelect} FROM utilisateurs ORDER BY id_utilisateur DESC`);
};

const getUserUsageCounts = async (id) => {
    const [abonnesCount] = await query(
        'SELECT COUNT(*) AS total FROM `abonnés` WHERE id_utilisateur = ?',
        [id],
    );
    const [subscriptionsCount] = await query(`
        SELECT COUNT(*) AS total
        FROM abonnement sub
        INNER JOIN \`abonnés\` abb ON sub.\`id_abonnés\` = abb.\`id_abonnés\`
        WHERE abb.id_utilisateur = ?
    `, [id]);

    return {
        abonnes: Number(abonnesCount?.total || 0),
        subscriptions: Number(subscriptionsCount?.total || 0),
    };
};

const createUser = async ({ nom, prenom, email, mot_de_passe, Role = 'utilisateur' }) => {
    const result = await query(`
        INSERT INTO utilisateurs
            (nom_utilisateur, \`prénom_utilisateur\`, email, mot_de_passe, Role, \`Date_création\`)
        VALUES (?, ?, ?, ?, ?, CURDATE())
    `, [nom, prenom, email, mot_de_passe, Role]);

    return {
        id_utilisateur: result.insertId,
        nom_utilisateur: nom,
        prenom_utilisateur: prenom,
        email,
        Role,
        actif: 1,
        Date_creation: new Date().toISOString().split('T')[0],
    };
};

const updateUser = async (id, nom, prenom, email, mot_de_passe) => {
    if (!id || isNaN(id)) {
        throw new Error('ID utilisateur invalide');
    }

    if (mot_de_passe) {
        return query(`
            UPDATE utilisateurs
            SET nom_utilisateur = ?, \`prénom_utilisateur\` = ?, email = ?, mot_de_passe = ?
            WHERE id_utilisateur = ?
        `, [nom, prenom, email, mot_de_passe, id]);
    }

    return query(`
        UPDATE utilisateurs
        SET nom_utilisateur = ?, \`prénom_utilisateur\` = ?, email = ?
        WHERE id_utilisateur = ?
    `, [nom, prenom, email, id]);
};

const updateUserRole = async (id, Role) => {
    if (!id || isNaN(id)) {
        throw new Error('ID utilisateur invalide');
    }

    return query('UPDATE utilisateurs SET Role = ? WHERE id_utilisateur = ?', [Role, id]);
};

const updateUserStatus = async (id, actif) => {
    if (!id || isNaN(id)) {
        throw new Error('ID utilisateur invalide');
    }

    return query('UPDATE utilisateurs SET actif = ? WHERE id_utilisateur = ?', [actif ? 1 : 0, id]);
};

module.exports = {
    ensureAccountStatusColumn,
    findUserByEmail,
    findUserById,
    getAllUsers,
    getUserUsageCounts,
    createUser,
    updateUser,
    updateUserRole,
    updateUserStatus,
};
