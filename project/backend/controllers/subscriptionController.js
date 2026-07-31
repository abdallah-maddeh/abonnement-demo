const Subscription = require('../models/Subscription');

const formatSubscription = (item) => ({
    id: item.id,
    titre: item.titre,
    type: item.type,
    ligne: item.ligne,
    ligneArrivee: item.ligneArrivee || null,
    prix: item.prix,
    dateDebut: item.dateDebut,
    dateFin: item.dateFin,
    dateDemande: item.dateDemande || item.dateDebut,
    status: item.status,
    userId: item.userId,
    userNom: item.userNom,
    userPrenom: item.userPrenom,
    userEmail: item.userEmail,
    nom: item.userNom || item.nom,
    prenom: item.userPrenom || item.prenom,
    ctt: item.userEmail || item.ctt,
});

const isAdmin = (req) => req.user?.Role === 'admin' || req.user?.role === 'admin';

const canAccessSubscription = (req, subscription) => {
    return isAdmin(req) || Number(subscription.idUtilisateur) === Number(req.userId);
};

const requireAdmin = (req, res) => {
    if (!isAdmin(req)) {
        res.status(403).json({ message: 'Acces reserve aux administrateurs' });
        return false;
    }
    return true;
};

const getSubscriptions = async (req, res) => {
    try {
        const subscriptions = isAdmin(req)
            ? await Subscription.getAllSubscriptions()
            : await Subscription.getSubscriptionsByUserId(req.userId);

        res.json({ subscriptions: subscriptions.map(formatSubscription) });
    } catch (error) {
        console.error('Erreur getSubscriptions:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription.getSubscriptionById(req.params.id);
        if (!subscription) {
            return res.status(404).json({ message: 'Demande d abonnement introuvable' });
        }

        if (!canAccessSubscription(req, subscription)) {
            return res.status(403).json({ message: 'Acces non autorise a cette demande' });
        }

        res.json({ subscription: formatSubscription(subscription) });
    } catch (error) {
        console.error('Erreur getSubscriptionById:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const getSubscriptionLines = async (req, res) => {
    try {
        const lines = await Subscription.getLines();
        res.json(lines);
    } catch (error) {
        console.error('Erreur getSubscriptionLines:', error);
        res.status(500).json({ message: error.message || 'Erreur chargement lignes' });
    }
};

const getSubscriptionTypes = (req, res) => {
    res.json(Subscription.getSubscriptionTypes());
};

const getSubscriptionPrice = async (req, res) => {
    try {
        const { type, lineId } = req.query;
        if (!type || !lineId) {
            return res.status(400).json({ message: 'Le type et la ligne sont requis' });
        }

        const calculation = await Subscription.calculateSubscriptionPrice(type, lineId);
        res.json({
            prix: calculation.prix,
            tarifMensuel: calculation.tarifMensuel,
            dureeMois: calculation.months,
            remiseDuree: calculation.durationRate,
            coefficientCategorie: calculation.categoryRate,
        });
    } catch (error) {
        res.status(400).json({ message: error.message || 'Impossible de calculer le prix' });
    }
};

const createSubscription = async (req, res) => {
    try {
        const subscription = {
            ...req.body,
            currentUserId: req.userId,
            currentUserNom: req.user?.nom_utilisateur,
            currentUserPrenom: req.user?.prenom_utilisateur,
            currentUserEmail: req.user?.email,
        };

        const userIsAdmin = isAdmin(req);
        const hasNewPayload = subscription.type_abonnement && subscription.id_ligne && subscription.date_debut;
        const hasLegacyPayload = subscription.type && subscription.ligne && subscription.dateDebut && subscription.dateFin;

        if (!hasNewPayload && !hasLegacyPayload) {
            return res.status(400).json({ message: 'Champs requis manquants' });
        }

        if (!userIsAdmin && !hasNewPayload) {
            return res.status(403).json({ message: 'Un utilisateur peut uniquement envoyer une demande d abonnement' });
        }

        const calculatedPrice = hasNewPayload
            ? await Subscription.calculateSubscriptionPrice(subscription.type_abonnement, subscription.id_ligne)
            : null;
        const prix = calculatedPrice
            ? calculatedPrice.prix
            : Number(subscription.prix ?? subscription.Montant);
        if (!Number.isFinite(prix) || prix <= 0) {
            return res.status(400).json({ message: 'Le prix doit être renseigné et supérieur à zéro' });
        }

        const created = await Subscription.createSubscription({
            ...subscription,
            prix,
            status: userIsAdmin ? (subscription.status || Subscription.STATUSES.PENDING) : Subscription.STATUSES.PENDING,
        });
        res.status(201).json({ subscription: formatSubscription(created) });
    } catch (error) {
        console.error('Erreur createSubscription:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const updateSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.getSubscriptionById(req.params.id);
        if (!subscription) {
            return res.status(404).json({ message: 'Demande d abonnement introuvable' });
        }

        let updates = req.body;

        if (!isAdmin(req)) {
            if (!canAccessSubscription(req, subscription)) {
                return res.status(403).json({ message: 'Acces non autorise a cette demande' });
            }

            const editableFields = ['nom', 'prenom', 'ctt'];
            const forbiddenFields = Object.keys(req.body || {}).filter((field) => !editableFields.includes(field));
            if (forbiddenFields.length > 0) {
                return res.status(403).json({ message: 'Vous pouvez modifier uniquement le nom, le prenom et le contact' });
            }

            updates = {
                nom: req.body.nom,
                prenom: req.body.prenom,
                ctt: req.body.ctt,
            };
        }

        const updated = await Subscription.updateSubscription(req.params.id, updates);
        if (!updated) {
            return res.status(404).json({ message: 'Demande d abonnement introuvable' });
        }

        res.json({ subscription: formatSubscription(updated) });
    } catch (error) {
        console.error('Erreur updateSubscription:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const validateSubscription = async (req, res) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const subscription = await Subscription.getSubscriptionById(req.params.id);
        if (!subscription) {
            return res.status(404).json({ message: 'Demande d abonnement introuvable' });
        }

        if (!Number(subscription.prix)) {
            return res.status(400).json({ message: 'Veuillez renseigner le prix avant de valider la demande' });
        }

        const updated = await Subscription.updateSubscriptionStatus(req.params.id, Subscription.STATUSES.VALIDATED);
        if (!updated) {
            return res.status(404).json({ message: 'Demande d abonnement introuvable' });
        }

        res.json({
            message: 'Demande d abonnement validee',
            subscription: formatSubscription(updated),
        });
    } catch (error) {
        console.error('Erreur validateSubscription:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const refuseSubscription = async (req, res) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const updated = await Subscription.updateSubscriptionStatus(req.params.id, Subscription.STATUSES.REFUSED);
        if (!updated) {
            return res.status(404).json({ message: 'Demande d abonnement introuvable' });
        }

        res.json({
            message: 'Demande d abonnement refusee',
            subscription: formatSubscription(updated),
        });
    } catch (error) {
        console.error('Erreur refuseSubscription:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

const deleteSubscription = async (req, res) => {
    try {
        if (!requireAdmin(req, res)) {
            return;
        }

        const result = await Subscription.deleteSubscription(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Demande d abonnement introuvable' });
        }

        res.json({ message: 'Demande d abonnement supprimee' });
    } catch (error) {
        console.error('Erreur deleteSubscription:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

module.exports = {
    getSubscriptions,
    getSubscriptionById,
    getSubscriptionLines,
    getSubscriptionTypes,
    getSubscriptionPrice,
    createSubscription,
    updateSubscription,
    validateSubscription,
    refuseSubscription,
    deleteSubscription,
};
