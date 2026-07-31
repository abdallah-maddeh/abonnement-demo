// filepath: project/backend/models/Subscription.js
// Modele Subscription - Gestion des abonnements MySQL

const db = require('../config/db');

const typeLabels = {
    1: 'Mensuel',
    2: 'Annuel',
    3: 'Etudiant',
    4: 'Professionnel',
};

const STATUSES = {
    PENDING: 'en_attente',
    VALIDATED: 'validee',
    REFUSED: 'refusee',
};

const DEFAULT_DEPARTURE = 'Bizerte';

const SUBSCRIPTION_TYPES = [
    { id: 'scolaire_annuel', label: 'Scolaire annuel', duration: 'year' },
    { id: 'scolaire_mensuel', label: 'Scolaire mensuel', duration: 'month' },
    { id: 'scolaire_premier_semestre', label: 'Scolaire premier semestre', duration: 'semester' },
    { id: 'scolaire_deuxieme_semestre', label: 'Scolaire deuxième semestre', duration: 'semester' },
    { id: 'scolaire_stagiaire_annuel', label: 'Scolaire stagiaire annuel', duration: 'year' },
    { id: 'scolaire_stagiaire_premier_semestre', label: 'Scolaire stagiaire premier semestre', duration: 'semester' },
    { id: 'scolaire_stagiaire_deuxieme_semestre', label: 'Scolaire stagiaire deuxième semestre', duration: 'semester' },
    { id: 'civil_annuel', label: 'Civil annuel', duration: 'year' },
    { id: 'civil_mensuel', label: 'Civil mensuel', duration: 'month' },
    { id: 'civil_premier_semestre', label: 'Civil premier semestre', duration: 'semester' },
    { id: 'civil_deuxieme_semestre', label: 'Civil deuxième semestre', duration: 'semester' },
];

const FALLBACK_LINES = [
    '273 Bizerte - El Azib',
    'Bizerte - Ain Meriem',
    'Bizerte - Borj Taleb',
    'Bizerte 515',
    'Bizerte - Piège',
    'Rainy - Balade',
    'Belle Maison - Bizerte',
    'Bizerte - Nador',
    'Matar - Tarifa',
    'm. Bourguiba - Louata',
    'Bizerte - Complexe universitaire, Menzel Abdel Rahman',
    'Bizerte - Aïn Bardeh',
    'Bizerte - Alia',
    'Bizerte - Beni Aouf',
    '223 Bizerte - Beni Amar',
    "Bizerte - Maison d'Abdel Rahman",
    'Bizerte - Corniche',
    'Bizerte - Sidi Ahmed',
];

// Tarif mensuel civil de référence pour chaque ligne (TND).
// Formule finale : tarif ligne × nombre de mois × remise durée × coefficient catégorie.
const FALLBACK_LINE_MONTHLY_TARIFFS = [
    30, 20, 25, 20, 25, 30, 25, 30, 40,
    45, 25, 30, 35, 40, 40, 25, 20, 20,
];

const TYPE_PRICE_RULES = {
    scolaire_annuel: { months: 12, durationRate: 0.80, categoryRate: 0.60 },
    scolaire_mensuel: { months: 1, durationRate: 1, categoryRate: 0.60 },
    scolaire_premier_semestre: { months: 6, durationRate: 0.90, categoryRate: 0.60 },
    scolaire_deuxieme_semestre: { months: 6, durationRate: 0.90, categoryRate: 0.60 },
    scolaire_stagiaire_annuel: { months: 12, durationRate: 0.80, categoryRate: 0.70 },
    scolaire_stagiaire_premier_semestre: { months: 6, durationRate: 0.90, categoryRate: 0.70 },
    scolaire_stagiaire_deuxieme_semestre: { months: 6, durationRate: 0.90, categoryRate: 0.70 },
    civil_annuel: { months: 12, durationRate: 0.80, categoryRate: 1 },
    civil_mensuel: { months: 1, durationRate: 1, categoryRate: 1 },
    civil_premier_semestre: { months: 6, durationRate: 0.90, categoryRate: 1 },
    civil_deuxieme_semestre: { months: 6, durationRate: 0.90, categoryRate: 1 },
};

const normalizeText = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

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

const getNextId = async (table, column) => {
    const rows = await query(`SELECT COALESCE(MAX(\`${column}\`), 0) + 1 AS nextId FROM \`${table}\``);
    return rows[0]?.nextId || 1;
};

const tableExists = async (tableName) => {
    const rows = await query(`
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
        LIMIT 1
    `, [tableName]);

    return Boolean(rows[0]);
};

const getTableColumns = async (tableName) => {
    const rows = await query(`SHOW COLUMNS FROM \`${tableName}\``);
    return rows.map((row) => row.Field);
};

const pickColumn = (columns, candidates) => {
    const normalizedColumns = new Map(columns.map((column) => [normalizeText(column), column]));
    return candidates.map(normalizeText).map((candidate) => normalizedColumns.get(candidate)).find(Boolean);
};

const toDateInputValue = (date) => date.toISOString().slice(0, 10);

const addMonths = (dateValue, months) => {
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    date.setMonth(date.getMonth() + months);
    return toDateInputValue(date);
};

const getSubscriptionTypes = () => SUBSCRIPTION_TYPES;

const resolveSubscriptionType = (value) => {
    const normalizedValue = normalizeText(value);
    return SUBSCRIPTION_TYPES.find((type) => (
        type.id === value || normalizeText(type.label) === normalizedValue
    ));
};

const calculateEndDate = (dateDebut, typeValue) => {
    const type = resolveSubscriptionType(typeValue);
    if (!dateDebut || !type) {
        return '';
    }

    if (type.duration === 'year') {
        return addMonths(dateDebut, 12);
    }

    if (type.duration === 'month') {
        return addMonths(dateDebut, 1);
    }

    return addMonths(dateDebut, 6);
};

const getFallbackLines = () => FALLBACK_LINES.map((label, index) => ({
    id_ligne: index + 1,
    label,
    tarifMensuel: FALLBACK_LINE_MONTHLY_TARIFFS[index],
}));

const getLines = async () => {
    if (!(await tableExists('dim_ligne'))) {
        return getFallbackLines();
    }

    const columns = await getTableColumns('dim_ligne');
    const idColumn = pickColumn(columns, ['id_ligne', 'id', 'id_line', 'line_id', 'code_ligne']);
    const labelColumn = pickColumn(columns, ['lib_ligne', 'nom_ligne', 'libelle', 'label', 'ligne', 'nom']);

    if (!idColumn || !labelColumn) {
        return getFallbackLines();
    }

    const rows = await query(`
        SELECT \`${idColumn}\` AS id_ligne, \`${labelColumn}\` AS label
        FROM dim_ligne
        ORDER BY \`${labelColumn}\` ASC
    `);

    const lines = rows.map((row) => ({
        id_ligne: row.id_ligne,
        label: row.label,
    })).filter((line) => line.id_ligne && line.label);

    return lines.length > 0
        ? lines
        : getFallbackLines();
};

const getLineById = async (id) => {
    if (!id) {
        return null;
    }

    if (!(await tableExists('dim_ligne'))) {
        const lines = await getLines();
        return lines.find((line) => String(line.id_ligne) === String(id)) || null;
    }

    const columns = await getTableColumns('dim_ligne');
    const idColumn = pickColumn(columns, ['id_ligne', 'id', 'id_line', 'line_id', 'code_ligne']);
    const labelColumn = pickColumn(columns, ['lib_ligne', 'nom_ligne', 'libelle', 'label', 'ligne', 'nom']);

    if (!idColumn || !labelColumn) {
        const lines = await getLines();
        return lines.find((line) => String(line.id_ligne) === String(id)) || null;
    }

    const rows = await query(
        `SELECT \`${idColumn}\` AS id_ligne, \`${labelColumn}\` AS label FROM dim_ligne WHERE \`${idColumn}\` = ? LIMIT 1`,
        [id]
    );
    return rows[0] ? { id_ligne: rows[0].id_ligne, label: rows[0].label } : null;
};

const calculateSubscriptionPrice = async (typeValue, lineId) => {
    const selectedType = resolveSubscriptionType(typeValue);
    const selectedLine = await getLineById(lineId);
    const rule = selectedType ? TYPE_PRICE_RULES[selectedType.id] : null;

    if (!selectedType || !selectedLine || !rule) {
        throw new Error('Type ou ligne invalide pour le calcul du prix');
    }

    const monthlyTariff = Number(selectedLine.tarifMensuel);
    if (!Number.isFinite(monthlyTariff) || monthlyTariff <= 0) {
        throw new Error('Aucun tarif configuré pour cette ligne');
    }

    const prix = Math.round(
        monthlyTariff * rule.months * rule.durationRate * rule.categoryRate * 100
    ) / 100;

    return {
        prix,
        tarifMensuel: monthlyTariff,
        months: rule.months,
        durationRate: rule.durationRate,
        categoryRate: rule.categoryRate,
        type: selectedType,
        line: selectedLine,
    };
};

const resolveTypeId = async (value) => {
    if (value === undefined || value === null || value === '') {
        return 1;
    }

    const numeric = Number(value);
    if (!Number.isNaN(numeric) && numeric > 0) {
        return numeric;
    }

    const normalized = normalizeText(value).replace(/^type\s+/, '');
    const fallbackMap = {
        mensuel: 1,
        annuel: 2,
        etudiant: 3,
        professionnel: 4,
    };

    const rows = await query(
        'SELECT id_types FROM type_abonnement WHERE LOWER(nom) = ? LIMIT 1',
        [normalized]
    );

    return rows[0]?.id_types || fallbackMap[normalized] || 1;
};

const getDefaultAgenceId = async (subscription) => {
    if (subscription.ID_Agence || subscription.idAgence) {
        return subscription.ID_Agence || subscription.idAgence;
    }

    const rows = await query('SELECT ID_Agence FROM Agence ORDER BY ID_Agence LIMIT 1');
    if (rows[0]?.ID_Agence) {
        return rows[0].ID_Agence;
    }

    const result = await query(
        'INSERT INTO Agence (nom_Agence, description) VALUES (?, ?)',
        ['SRTB', 'Agence par defaut']
    );
    return result.insertId;
};

const toPhoneNumber = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    return digits ? Number(digits.slice(0, 10)) : 0;
};

const toSubscriptionPayload = (row = {}) => {
    const idType = row.idType || row.id_type || 1;
    const typeName = row.requestedType || row.typeName || typeLabels[idType] || `Type ${idType}`;
    const ligne = row.ligne;
    const ligneArrivee = row.ligneArrivee || null;
    const hasDuplicatedBizerteRoute = ligne
        && ligneArrivee
        && normalizeText(ligne) === normalizeText(ligneArrivee)
        && normalizeText(ligne).startsWith(normalizeText(`${DEFAULT_DEPARTURE} -`));

    return {
        id: row.id,
        idType,
        titre: row.titre || typeName,
        type: typeName,
        ligne: hasDuplicatedBizerteRoute ? DEFAULT_DEPARTURE : ligne,
        ligneArrivee,
        prix: row.prix,
        dateDebut: row.dateDebut,
        dateFin: row.dateFin,
        dateDemande: row.dateDemande || row.dateDebut,
        status: row.status,
        userId: row.userId,
        idUtilisateur: row.idUtilisateur,
        userNom: row.userNom || row.nom || '',
        userPrenom: row.userPrenom || row.prenom || '',
        userEmail: row.userEmail || row.ctt || '',
        nom: row.userNom || row.nom || '',
        prenom: row.userPrenom || row.prenom || '',
        ctt: row.userEmail || row.ctt || '',
    };
};

const getSubscriptionById = async (id) => {
    const rows = await query(`
        SELECT
            sub.id_abonnment as id,
            sub.\`id_abonnés\` as userId,
            sub.id_type as idType,
            typ.nom as typeName,
            sub.\`ligne_départ\` as ligne,
            sub.\`ligne_arrivée\` as ligneArrivee,
            sub.Montant as prix,
            sub.Renouvellement as requestedType,
            sub.date_debut as dateDebut,
            sub.date_fin as dateFin,
            sub.statut as status,
            abb.Date_inscription as dateDemande,
            abb.id_utilisateur as idUtilisateur,
            abb.Nom as userNom,
            abb.\`prénom\` as userPrenom,
            abb.Email as userEmail
        FROM abonnement sub
        LEFT JOIN \`abonnés\` abb ON sub.\`id_abonnés\` = abb.\`id_abonnés\`
        LEFT JOIN type_abonnement typ ON sub.id_type = typ.id_types
        WHERE sub.id_abonnment = ?
    `, [id]);

    return rows[0] ? toSubscriptionPayload(rows[0]) : null;
};

const getOrCreateAbonnee = async (subscription) => {
    const explicitId = subscription.id_abonnes || subscription.id_abonnés || subscription.userId;
    if (explicitId) {
        return explicitId;
    }

    const nom = subscription.userNom || subscription.nom || subscription.currentUserNom || 'Utilisateur';
    const prenom = subscription.userPrenom || subscription.prenom || subscription.currentUserPrenom || '';
    const contact = subscription.userEmail || subscription.contact || subscription.ctt || subscription.currentUserEmail || '';
    const email = String(contact).includes('@') ? contact : (subscription.currentUserEmail || '');
    const telephone = subscription.telephone || subscription.Téléphone || toPhoneNumber(contact);
    const idUtilisateur = subscription.id_utilisateur || subscription.currentUserId || null;
    const adresse = subscription.Adresse || subscription.adresse || '';
    const agenceId = await getDefaultAgenceId(subscription);

    if (email) {
        const existing = await query('SELECT `id_abonnés` FROM `abonnés` WHERE Email = ? LIMIT 1', [email]);
        if (existing[0]) {
            return existing[0].id_abonnés;
        }
    }

    const abonneeId = await getNextId('abonnés', 'id_abonnés');

    await query(`
        INSERT INTO \`abonnés\`
            (\`id_abonnés\`, id_utilisateur, Nom, \`prénom\`, Adresse, \`Téléphone\`, Email, Date_inscription, ID_Agence)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)
    `, [abonneeId, idUtilisateur, nom, prenom, adresse, telephone, email, agenceId]);

    return abonneeId;
};

const getAllSubscriptions = async () => {
    const rows = await query(`
        SELECT
            sub.id_abonnment as id,
            sub.\`id_abonnés\` as userId,
            sub.id_type as idType,
            typ.nom as typeName,
            sub.\`ligne_départ\` as ligne,
            sub.\`ligne_arrivée\` as ligneArrivee,
            sub.Montant as prix,
            sub.Renouvellement as requestedType,
            sub.date_debut as dateDebut,
            sub.date_fin as dateFin,
            sub.statut as status,
            abb.Date_inscription as dateDemande,
            abb.id_utilisateur as idUtilisateur,
            abb.Nom as userNom,
            abb.\`prénom\` as userPrenom,
            abb.Email as userEmail
        FROM abonnement sub
        LEFT JOIN \`abonnés\` abb ON sub.\`id_abonnés\` = abb.\`id_abonnés\`
        LEFT JOIN type_abonnement typ ON sub.id_type = typ.id_types
        ORDER BY sub.id_abonnment DESC
    `);

    return rows.map(toSubscriptionPayload);
};

const getSubscriptionsByUserId = async (userId) => {
    const rows = await query(`
        SELECT
            sub.id_abonnment as id,
            sub.\`id_abonnés\` as userId,
            sub.id_type as idType,
            typ.nom as typeName,
            sub.\`ligne_départ\` as ligne,
            sub.\`ligne_arrivée\` as ligneArrivee,
            sub.Montant as prix,
            sub.Renouvellement as requestedType,
            sub.date_debut as dateDebut,
            sub.date_fin as dateFin,
            sub.statut as status,
            abb.Date_inscription as dateDemande,
            abb.id_utilisateur as idUtilisateur,
            abb.Nom as userNom,
            abb.\`prénom\` as userPrenom,
            abb.Email as userEmail
        FROM abonnement sub
        LEFT JOIN \`abonnés\` abb ON sub.\`id_abonnés\` = abb.\`id_abonnés\`
        LEFT JOIN type_abonnement typ ON sub.id_type = typ.id_types
        WHERE abb.id_utilisateur = ?
        ORDER BY sub.date_debut DESC, sub.id_abonnment DESC
    `, [userId]);

    return rows.map(toSubscriptionPayload);
};

const createSubscription = async (subscription) => {
    const abonneeId = await getOrCreateAbonnee(subscription);
    const subscriptionId = await getNextId('abonnement', 'id_abonnment');
    const selectedType = resolveSubscriptionType(subscription.type_abonnement || subscription.type);
    const idType = subscriptionId;
    const selectedLine = await getLineById(subscription.id_ligne);
    const ligne = subscription.ligne_depart || subscription.ligne_départ || (selectedLine ? DEFAULT_DEPARTURE : subscription.ligne);
    const ligneArrivee = subscription.ligne_arrivee || subscription.ligne_arrivée || subscription.ligneArrivee || selectedLine?.label || ligne;
    const prix = Number(subscription.Montant ?? subscription.prix);
    const dateDebut = subscription.date_debut || subscription.dateDebut;
    const calculatedDateFin = calculateEndDate(dateDebut, selectedType?.id || selectedType?.label || subscription.type_abonnement || subscription.type);
    const dateFin = calculatedDateFin || subscription.date_fin || subscription.dateFin;
    const renouvellement = subscription.Renouvellement || selectedType?.label || subscription.type_abonnement || subscription.type || '';
    const statut = subscription.statut || subscription.status || STATUSES.PENDING;

    await query(`
        INSERT INTO abonnement
            (id_abonnment, \`id_abonnés\`, id_type, \`ligne_départ\`, \`ligne_arrivée\`, Montant, date_debut, date_fin, Renouvellement, statut)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [subscriptionId, abonneeId, idType, ligne, ligneArrivee, prix, dateDebut, dateFin, renouvellement, statut]);

    return getSubscriptionById(subscriptionId);
};

const updateSubscription = async (id, updates) => {
    const existing = await getSubscriptionById(id);
    if (!existing) {
        return null;
    }

    const hasAbonneeUpdates = (
        updates.nom !== undefined ||
        updates.prenom !== undefined ||
        updates.ctt !== undefined ||
        updates.userNom !== undefined ||
        updates.userPrenom !== undefined ||
        updates.userEmail !== undefined
    );

    if (hasAbonneeUpdates && existing.userId) {
        const contact = updates.userEmail || updates.ctt || existing.userEmail;
        const email = String(contact).includes('@') ? contact : existing.userEmail;
        await query(
            'UPDATE `abonnés` SET Nom = ?, `prénom` = ?, Email = ?, `Téléphone` = ? WHERE `id_abonnés` = ?',
            [
                updates.userNom || updates.nom || existing.userNom,
                updates.userPrenom || updates.prenom || existing.userPrenom,
                email,
                toPhoneNumber(contact),
                existing.userId,
            ]
        );
    }

    const idType = existing.idType || existing.id || id;
    const ligne = updates.ligne_depart || updates.ligne_départ || updates.ligne || existing.ligne;
    const ligneArrivee = updates.ligne_arrivee !== undefined
        ? updates.ligne_arrivee
        : (updates.ligne_arrivée !== undefined ? updates.ligne_arrivée : (updates.ligneArrivee !== undefined ? updates.ligneArrivee : existing.ligneArrivee));
    const prix = updates.Montant !== undefined
        ? updates.Montant
        : (updates.prix !== undefined ? updates.prix : existing.prix);
    const dateDebut = updates.date_debut || updates.dateDebut || existing.dateDebut;
    const dateFin = updates.date_fin || updates.dateFin || existing.dateFin;
    const renouvellement = updates.Renouvellement || updates.type || existing.type || '';
    const statut = updates.statut || updates.status || existing.status;

    await query(`
        UPDATE abonnement
        SET
            id_type = ?,
            \`ligne_départ\` = ?,
            \`ligne_arrivée\` = ?,
            Montant = ?,
            date_debut = ?,
            date_fin = ?,
            Renouvellement = ?,
            statut = ?
        WHERE id_abonnment = ?
    `, [idType, ligne, ligneArrivee || null, prix, dateDebut, dateFin, renouvellement, statut, id]);

    return getSubscriptionById(id);
};

const deleteSubscription = async (id) => {
    await query('SET FOREIGN_KEY_CHECKS = 0');
    try {
        return await query('DELETE FROM abonnement WHERE id_abonnment = ?', [id]);
    } finally {
        await query('SET FOREIGN_KEY_CHECKS = 1');
    }
};

const updateSubscriptionStatus = async (id, status) => {
    const allowedStatuses = Object.values(STATUSES);
    if (!allowedStatuses.includes(status)) {
        throw new Error('Statut de demande invalide');
    }

    const existing = await getSubscriptionById(id);
    if (!existing) {
        return null;
    }

    await query('UPDATE abonnement SET statut = ? WHERE id_abonnment = ?', [status, id]);
    return getSubscriptionById(id);
};

module.exports = {
    getAllSubscriptions,
    getSubscriptionById,
    getSubscriptionsByUserId,
    getLines,
    getSubscriptionTypes,
    calculateSubscriptionPrice,
    createSubscription,
    updateSubscription,
    updateSubscriptionStatus,
    deleteSubscription,
    calculateEndDate,
    STATUSES,
};
