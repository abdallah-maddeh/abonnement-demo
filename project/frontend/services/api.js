// filepath: project/frontend/services/api.js
// Service API fictif - Données locales pour la version DEMO
const STORAGE_KEY = 'demo_data';
const AUTH_KEY = 'demo_auth';

const generateId = () => `demo-${Math.random().toString(36).slice(2, 10)}`;
const todayIso = () => new Date().toISOString();
const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toISOString().slice(0, 10);
};

const defaultData = {
    utilisateurs: [
        {
            id: generateId(),
            prenom: 'Sofia',
            nom: 'Ben Ali',
            email: 'sofia.admin@demo.com',
            role: 'admin',
            actif: true,
            dateCreation: '01/03/2026',
        },
        {
            id: generateId(),
            prenom: 'Ali',
            nom: 'Kacem',
            email: 'ali.utilisateur@demo.com',
            role: 'utilisateur',
            actif: true,
            dateCreation: '05/03/2026',
        },
        {
            id: generateId(),
            prenom: 'Lina',
            nom: 'Haddad',
            email: 'lina@demo.com',
            role: 'utilisateur',
            actif: true,
            dateCreation: '10/03/2026',
        },
    ],
    agences: [
        { id: generateId(), nom: 'Agence Tunis Centre', region: 'Tunis', responsable: 'Nadia F.' },
        { id: generateId(), nom: 'Agence Sousse Est', region: 'Sousse', responsable: 'Karim M.' },
        { id: generateId(), nom: 'Agence Bizerte Nord', region: 'Bizerte', responsable: 'Youssef Z.' },
    ],
    lignes: [
        { id_ligne: 1, label: 'Ligne 1', depart: 'Tunis', arrivee: 'Sousse' },
        { id_ligne: 2, label: 'Ligne 2', depart: 'Sousse', arrivee: 'Monastir' },
        { id_ligne: 3, label: 'Ligne 3', depart: 'Monastir', arrivee: 'Mahdia' },
        { id_ligne: 4, label: 'Ligne 4', depart: 'Bizerte', arrivee: 'Tunis' },
        { id_ligne: 5, label: 'Ligne 5', depart: 'Kairouan', arrivee: 'Sfax' },
    ],
    typesAbonnement: [
        { id: 'Mensuel', label: 'Mensuel', duration: 'month', basePrice: 1200 },
        { id: 'Trimestriel', label: 'Trimestriel', duration: 'month', basePrice: 3400 },
        { id: 'Annuel', label: 'Annuel', duration: 'year', basePrice: 12000 },
    ],
    abonnements: [
        {
            id: generateId(),
            titre: 'Abonnement Premium',
            type: 'Annuel',
            ligne: 'Ligne 1',
            prix: 12000,
            dateDebut: '2026-04-01',
            dateFin: '2027-04-01',
            status: 'actif',
            userPrenom: 'Sofia',
            userNom: 'Ben Ali',
            userEmail: 'sofia.admin@demo.com',
            ctt: '+216 20 000 001',
        },
        {
            id: generateId(),
            titre: 'Abonnement Standard',
            type: 'Mensuel',
            ligne: 'Ligne 4',
            prix: 1200,
            dateDebut: '2026-06-15',
            dateFin: '2026-07-15',
            status: 'actif',
            userPrenom: 'Ali',
            userNom: 'Kacem',
            userEmail: 'ali.utilisateur@demo.com',
            ctt: '+216 20 000 002',
        },
        {
            id: generateId(),
            titre: 'Abonnement Étudiant',
            type: 'Mensuel',
            ligne: 'Ligne 2',
            prix: 1200,
            dateDebut: '2026-05-10',
            dateFin: '2026-06-10',
            status: 'validee',
            userPrenom: 'Lina',
            userNom: 'Haddad',
            userEmail: 'lina@demo.com',
            ctt: '+216 20 000 003',
        },
        {
            id: generateId(),
            titre: 'Abonnement Voyage',
            type: 'Trimestriel',
            ligne: 'Ligne 3',
            prix: 3400,
            dateDebut: '2026-01-01',
            dateFin: '2026-04-01',
            status: 'expire',
            userPrenom: 'Mehdi',
            userNom: 'Salem',
            userEmail: 'mehdi@demo.com',
            ctt: '+216 20 000 004',
        },
        {
            id: generateId(),
            titre: 'Demande en attente',
            type: 'Mensuel',
            ligne: 'Ligne 5',
            prix: 1200,
            dateDebut: '2026-07-01',
            dateFin: '2026-08-01',
            status: 'en_attente',
            userPrenom: 'Mouna',
            userNom: 'Jaballah',
            userEmail: 'mouna@demo.com',
            ctt: '+216 20 000 005',
        },
    ],
    rapports: [
        { id: generateId(), titre: 'Revenus mensuels', valeur: '12 400 TND', tendance: '+14%', description: 'Comparé au mois précédent.' },
        { id: generateId(), titre: 'Taux de conversion', valeur: '8.7%', tendance: '+2.3%', description: 'Nouveaux abonnements validés.' },
        { id: generateId(), titre: 'Qualité des lignes', valeur: '4.6/5', tendance: '+0.2', description: 'Basé sur les retours clients.' },
    ],
};

const loadDemoData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (err) {
            console.warn('Données de démonstration corrompues, réinitialisation.', err);
        }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return { ...defaultData };
};

const saveDemoData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
};

const loadAuth = () => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (err) {
        return null;
    }
};

const saveAuth = (auth) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
};

const clearAuth = () => {
    localStorage.removeItem(AUTH_KEY);
};

const normalizeRole = (role) => {
    if (role === 'admin') return 'admin';
    return 'utilisateur';
};

export const login = async (email, password, selectedRole = 'user') => {
    const roleKey = selectedRole === 'admin' ? 'admin' : 'user';
    const user = {
        id: generateId(),
        prenom: roleKey === 'admin' ? 'Admin' : 'Demo',
        nom: roleKey === 'admin' ? 'Démonstration' : 'Utilisateur',
        email,
        role: roleKey,
        actif: true,
        dateCreation: formatDate(todayIso()),
    };

    saveAuth({ isAuthenticated: true, role: roleKey, user });
    return Promise.resolve({ user: getCurrentUser(), token: 'demo-token' });
};

export const register = async (prenom, nom, email, mot_de_passe) => {
    const user = {
        id: generateId(),
        prenom,
        nom,
        email,
        role: 'user',
        actif: true,
        dateCreation: formatDate(todayIso()),
    };
    saveAuth({ isAuthenticated: true, role: 'user', user });

    const data = loadDemoData();
    data.utilisateurs.unshift({
        ...user,
        role: 'utilisateur',
    });
    saveDemoData(data);

    return Promise.resolve({ user: getCurrentUser(), token: 'demo-token' });
};

export const forgotPassword = async (email) => {
    return Promise.resolve({ message: `Un lien de réinitialisation a été envoyé à ${email}.` });
};

export const resetPassword = async (email, token, mot_de_passe) => {
    return Promise.resolve({ message: 'Votre mot de passe a été réinitialisé avec succès.' });
};

export const getCurrentUser = () => {
    const auth = loadAuth();
    if (!auth?.isAuthenticated) return null;

    const user = auth.user || {
        id: generateId(),
        prenom: 'Demo',
        nom: 'Utilisateur',
        email: 'demo@demo.com',
        role: auth.role || 'user',
        actif: true,
        dateCreation: formatDate(todayIso()),
    };

    return {
        ...user,
        role: normalizeRole(user.role),
    };
};

export const getDefaultAuthenticatedPath = () => {
    const auth = loadAuth();
    return auth?.role === 'admin' ? '/dashboard' : '/subscriptions';
};

export const isAuthenticated = () => {
    const auth = loadAuth();
    return !!auth?.isAuthenticated;
};

export const logout = () => {
    clearAuth();
};

export const resetDemoData = async () => {
    localStorage.removeItem(STORAGE_KEY);
    clearAuth();
    loadDemoData();
    return Promise.resolve({ message: 'Les données de démonstration ont été réinitialisées.' });
};

export const getProfile = async () => {
    return Promise.resolve({ user: getCurrentUser() });
};

export const updateProfile = async (prenom, nom, email, mot_de_passe) => {
    const auth = loadAuth();
    if (!auth?.isAuthenticated) {
        return Promise.resolve({ message: 'Vous devez être connecté pour mettre à jour votre profil.' });
    }

    const updatedUser = {
        ...auth.user,
        prenom,
        nom,
        email,
    };
    saveAuth({ ...auth, user: updatedUser });

    const data = loadDemoData();
    const index = data.utilisateurs.findIndex((item) => item.email === auth.user.email);
    if (index >= 0) {
        data.utilisateurs[index] = {
            ...data.utilisateurs[index],
            prenom,
            nom,
            email,
        };
        saveDemoData(data);
    }

    return Promise.resolve({ user: getCurrentUser() });
};

export const getUsers = async () => {
    const data = loadDemoData();
    return Promise.resolve({ users: data.utilisateurs });
};

export const createUser = async (user) => {
    const data = loadDemoData();
    const newUser = {
        id: generateId(),
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role === 'admin' ? 'admin' : 'utilisateur',
        actif: true,
        dateCreation: formatDate(todayIso()),
    };
    data.utilisateurs.unshift(newUser);
    saveDemoData(data);
    return Promise.resolve({ user: newUser });
};

export const updateUser = async (id, user) => {
    const data = loadDemoData();
    const index = data.utilisateurs.findIndex((item) => item.id === id);
    if (index < 0) {
        return Promise.resolve({ message: 'Utilisateur introuvable dans la démo.' });
    }

    const updatedUser = {
        ...data.utilisateurs[index],
        ...user,
    };
    data.utilisateurs[index] = updatedUser;
    saveDemoData(data);

    const auth = loadAuth();
    if (auth?.user?.id === id) {
        saveAuth({ ...auth, user: updatedUser });
    }

    return Promise.resolve({ user: updatedUser });
};

export const updateUserStatus = async (id, actif) => {
    const data = loadDemoData();
    const index = data.utilisateurs.findIndex((item) => item.id === id);
    if (index < 0) {
        return Promise.resolve({ message: 'Utilisateur introuvable dans la démo.' });
    }

    data.utilisateurs[index] = {
        ...data.utilisateurs[index],
        actif,
    };
    saveDemoData(data);

    return Promise.resolve({ user: data.utilisateurs[index] });
};

export const getSubscriptions = async () => {
    const data = loadDemoData();
    return Promise.resolve({ subscriptions: data.abonnements });
};

export const getSubscription = async (id) => {
    const data = loadDemoData();
    const subscription = data.abonnements.find((item) => item.id === id);
    if (!subscription) {
        return Promise.resolve({ message: 'Abonnement introuvable dans la démo.' });
    }
    return Promise.resolve({ subscription });
};

export const getSubscriptionLines = async () => {
    const data = loadDemoData();
    return Promise.resolve(data.lignes);
};

export const getSubscriptionTypes = async () => {
    const data = loadDemoData();
    return Promise.resolve(data.typesAbonnement);
};

export const getSubscriptionPrice = async (type, lineId) => {
    const data = loadDemoData();
    const selectedType = data.typesAbonnement.find((item) => item.id === type);
    const basePrice = selectedType?.basePrice || 1200;
    const price = basePrice + ((Number(lineId) || 1) - 1) * 80;
    return Promise.resolve({ prix: price });
};

export const createSubscription = async (subscription) => {
    const data = loadDemoData();
    const currentUser = getCurrentUser();
    const newSubscription = {
        id: generateId(),
        titre: subscription.titre || subscription.type || subscription.type_abonnement || 'Abonnement',
        type: subscription.type || subscription.type_abonnement || 'Mensuel',
        ligne: subscription.ligne || subscription.ligne_depart || 'Ligne 1',
        ligneArrivee: subscription.ligneArrivee || subscription.ligne_arrivee || '',
        prix: Number(subscription.prix) || 1200,
        dateDebut: subscription.dateDebut || formatDate(todayIso()),
        dateFin: subscription.dateFin || formatDate(new Date(Date.now() + 30 * 86400000)),
        status: subscription.status || 'en_attente',
        userPrenom: subscription.userPrenom || subscription.prenom || currentUser?.prenom || 'Demo',
        userNom: subscription.userNom || subscription.nom || currentUser?.nom || 'Utilisateur',
        userEmail: subscription.userEmail || subscription.contact || currentUser?.email || 'demo@demo.com',
        ctt: subscription.ctt || subscription.contact || currentUser?.email || 'demo@demo.com',
    };
    data.abonnements.unshift(newSubscription);
    saveDemoData(data);
    return Promise.resolve({ subscription: newSubscription });
};

export const updateSubscription = async (id, subscription) => {
    const data = loadDemoData();
    const index = data.abonnements.findIndex((item) => item.id === id);
    if (index < 0) {
        return Promise.resolve({ message: 'Abonnement introuvable dans la démo.' });
    }

    const updatedSubscription = {
        ...data.abonnements[index],
        ...subscription,
        dateDebut: subscription.dateDebut || data.abonnements[index].dateDebut,
        dateFin: subscription.dateFin || data.abonnements[index].dateFin,
    };
    data.abonnements[index] = updatedSubscription;
    saveDemoData(data);
    return Promise.resolve({ subscription: updatedSubscription });
};

export const deleteSubscription = async (id) => {
    const data = loadDemoData();
    const beforeCount = data.abonnements.length;
    data.abonnements = data.abonnements.filter((item) => item.id !== id);
    saveDemoData(data);
    if (data.abonnements.length === beforeCount) {
        return Promise.resolve({ message: 'Abonnement introuvable dans la démo.' });
    }
    return Promise.resolve({});
};

export const createSubscriptionRequest = async (request) => {
    return createSubscription({ ...request, status: 'en_attente' });
};

export const getSubscriptionRequests = async () => {
    const data = loadDemoData();
    const requests = data.abonnements.filter((subscription) => (
        subscription.status === 'en_attente' || subscription.status === 'pending'
    ));
    return Promise.resolve({ requests });
};

export const approveSubscriptionRequest = async (id) => {
    const data = loadDemoData();
    const index = data.abonnements.findIndex((item) => item.id === id);
    if (index < 0) {
        return Promise.resolve({ message: 'Demande introuvable dans la démo.' });
    }
    data.abonnements[index] = {
        ...data.abonnements[index],
        status: 'actif',
    };
    saveDemoData(data);
    return Promise.resolve({ subscription: data.abonnements[index] });
};

export const rejectSubscriptionRequest = async (id) => {
    const data = loadDemoData();
    const index = data.abonnements.findIndex((item) => item.id === id);
    if (index < 0) {
        return Promise.resolve({ message: 'Demande introuvable dans la démo.' });
    }
    data.abonnements[index] = {
        ...data.abonnements[index],
        status: 'refusee',
    };
    saveDemoData(data);
    return Promise.resolve({ subscription: data.abonnements[index] });
};

export const validateSubscription = approveSubscriptionRequest;
export const refuseSubscription = rejectSubscriptionRequest;

export const getDashboardData = async () => {
    const data = loadDemoData();
    const totalSubscriptions = data.abonnements.length;
    const activeSubscriptions = data.abonnements.filter((item) => item.status === 'actif' || item.status === 'validee').length;
    const pendingSubscriptions = data.abonnements.filter((item) => item.status === 'en_attente' || item.status === 'pending').length;
    const expiredSubscriptions = data.abonnements.filter((item) => item.status === 'expire' || item.status === 'refusee').length;
    const totalUsers = data.utilisateurs.length;
    const totalAgencies = data.agences.length;
    const totalLines = data.lignes.length;
    const monthlyRevenue = data.abonnements
        .filter((item) => item.status === 'actif' || item.status === 'validee')
        .reduce((sum, item) => sum + Number(item.prix || 0), 0);

    return Promise.resolve({
        totalSubscriptions,
        activeSubscriptions,
        pendingSubscriptions,
        expiredSubscriptions,
        totalUsers,
        totalAgencies,
        totalLines,
        monthlyRevenue,
        agencies: data.agences,
        lines: data.lignes,
        reports: data.rapports,
    });
};
