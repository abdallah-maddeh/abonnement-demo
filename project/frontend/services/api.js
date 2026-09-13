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
        {
            id: 'Scolaire',
            label: 'Abonnement Scolaire',
            duration: 'Mensualité scolaire',
            basePrice: 850,
            priceLabel: 'Tarif scolaire',
            eligibility: 'Élèves du secondaire',
            description: 'Une solution adaptée aux déplacements quotidiens des élèves.',
            benefits: ['Trajets domicile-établissement', 'Tarifs préférentiels', 'Suivi simple et sécurisé'],
            badge: 'POPULAIRE',
            color: '#3b82f6',
            accentSoft: 'rgba(59, 130, 246, 0.16)',
            accentGlow: 'rgba(59, 130, 246, 0.26)',
            icon: 'GraduationCap',
        },
        {
            id: 'Universitaire',
            label: 'Abonnement Universitaire',
            duration: 'Mensualité étudiant',
            basePrice: 950,
            priceLabel: 'Tarif étudiant',
            eligibility: 'Étudiants universitaires',
            description: 'Une formule pensée pour les trajets réguliers entre domicile, campus et résidence.',
            benefits: ['Accès rapide aux lignes majeures', 'Tarif étudiant', 'Gestion simplifiée'],
            badge: 'ÉTUDIANT',
            color: '#8b5cf6',
            accentSoft: 'rgba(139, 92, 246, 0.16)',
            accentGlow: 'rgba(139, 92, 246, 0.24)',
            icon: 'School',
        },
        {
            id: 'Professionnel',
            label: 'Abonnement Professionnel',
            duration: 'Mensualité pro',
            basePrice: 1450,
            priceLabel: 'Tarif professionnel',
            eligibility: 'Salariés et travailleurs',
            description: 'Une formule fiable pour les déplacements professionnels et quotidiens en toute sérénité.',
            benefits: ['Trajets domicile-travail', 'Rythme de validité pratique', 'Assistance prioritaire'],
            badge: 'PRO',
            color: '#10b981',
            accentSoft: 'rgba(16, 185, 129, 0.16)',
            accentGlow: 'rgba(16, 185, 129, 0.22)',
            icon: 'BriefcaseBusiness',
        },
        {
            id: 'Mensuel',
            label: 'Abonnement Mensuel',
            duration: '1 mois',
            basePrice: 1200,
            priceLabel: 'Tarif mensuel',
            eligibility: 'Tous passagers',
            description: 'Le format le plus simple pour rester mobile, sans engagement sur le long terme.',
            benefits: ['Flexibilité maximale', 'Paiement mensuel simple', 'Disponibilité immédiate'],
            badge: 'FLEXIBLE',
            color: '#06b6d4',
            accentSoft: 'rgba(6, 182, 212, 0.14)',
            accentGlow: 'rgba(6, 182, 212, 0.24)',
            icon: 'CalendarDays',
        },
        {
            id: 'Trimestriel',
            label: 'Abonnement Trimestriel',
            duration: '3 mois',
            basePrice: 3400,
            priceLabel: 'Tarif trimestriel',
            eligibility: 'Tous passagers',
            description: 'Un bon équilibre entre flexibilité et économie pour les déplacements réguliers.',
            benefits: ['Économie sur 3 mois', 'Mieux adapté aux habitudes', 'Régularité assurée'],
            badge: 'ÉCONOMIQUE',
            color: '#f59e0b',
            accentSoft: 'rgba(245, 158, 11, 0.16)',
            accentGlow: 'rgba(245, 158, 11, 0.24)',
            icon: 'CalendarRange',
        },
        {
            id: 'Annuel',
            label: 'Abonnement Annuel',
            duration: '12 mois',
            basePrice: 12000,
            priceLabel: 'Tarif annuel',
            eligibility: 'Tous passagers',
            description: 'La formule premium pour les voyageurs réguliers qui souhaitent une mobilité durable.',
            benefits: ['Tarif annuel optimisé', 'Réseau complet', 'Priorité d’assistance'],
            badge: 'MEILLEUR PLAN',
            color: '#6366f1',
            accentSoft: 'rgba(99, 102, 241, 0.16)',
            accentGlow: 'rgba(99, 102, 241, 0.24)',
            icon: 'CalendarCheck',
        },
        {
            id: 'VIP',
            label: 'Abonnement VIP',
            duration: 'Annuel premium',
            basePrice: 18500,
            priceLabel: 'Tarif premium',
            eligibility: 'Voyageurs premium',
            description: 'Une formule exclusive destinée aux voyageurs recherchant une expérience de transport privilégiée.',
            benefits: ['Accès prioritaire', 'Service premium', 'Expérience haut de gamme'],
            badge: 'EXCLUSIF',
            color: '#d4a85f',
            accentSoft: 'rgba(212, 168, 95, 0.16)',
            accentGlow: 'rgba(212, 168, 95, 0.24)',
            icon: 'Crown',
        },
        {
            id: 'Personnel',
            label: 'Abonnement Personnel SRTB',
            duration: 'Selon la politique interne',
            basePrice: 0,
            priceLabel: 'Tarif personnel',
            eligibility: 'Personnel SRTB',
            description: 'Une formule dédiée aux agents et employés de la SRTB pour leurs déplacements professionnels et quotidiens.',
            benefits: ['Déplacements internes facilités', 'Politiques internes appliquées', 'Accès réservé au personnel'],
            badge: 'PERSONNEL SRTB',
            color: '#1d4ed8',
            accentSoft: 'rgba(29, 78, 216, 0.16)',
            accentGlow: 'rgba(29, 78, 216, 0.24)',
            icon: 'Building2',
        },
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

const extraDemoUsers = [
    ['Ahmed', 'Ben Salah', 'ahmed.bensalah@example.com', '15/01/2026'],
    ['Sarra', 'Trabelsi', 'sarra.trabelsi@example.com', '21/02/2026'],
    ['Mohamed', 'Jlassi', 'mohamed.jlassi@example.com', '03/03/2026'],
    ['Nour', 'Mansour', 'nour.mansour@example.com', '12/03/2026'],
    ['Yasmine', 'Gharbi', 'yasmine.gharbi@example.com', '18/03/2026'],
    ['Houssem', 'Khelifi', 'houssem.khelifi@example.com', '26/03/2026'],
    ['Meriem', 'Chaabane', 'meriem.chaabane@example.com', '02/04/2026'],
];

const ensureDemoDensity = (data) => {
    const existingEmails = new Set(data.utilisateurs.map((user) => user.email));
    extraDemoUsers.forEach(([prenom, nom, email, dateCreation]) => {
        if (!existingEmails.has(email)) {
            data.utilisateurs.push({ id: generateId(), prenom, nom, email, role: 'utilisateur', actif: true, dateCreation });
        }
    });

    const demoSubscriptions = [
        ['Ahmed', 'Ben Salah', 'ahmed.bensalah@example.com', 'Abonnement Étudiant', 'Mensuel', 'Ligne 1', 1200, 'actif', '2026-09-01', '2026-10-01'],
        ['Sarra', 'Trabelsi', 'sarra.trabelsi@example.com', 'Abonnement Standard', 'Mensuel', 'Ligne 2', 1200, 'actif', '2026-08-15', '2026-09-15'],
        ['Mohamed', 'Jlassi', 'mohamed.jlassi@example.com', 'Abonnement Étudiant', 'Mensuel', 'Ligne 3', 1200, 'expire', '2026-07-01', '2026-08-01'],
        ['Nour', 'Mansour', 'nour.mansour@example.com', 'Abonnement Professionnel', 'Trimestriel', 'Ligne 4', 3400, 'validee', '2026-09-05', '2026-12-05'],
        ['Yasmine', 'Gharbi', 'yasmine.gharbi@example.com', 'Demande Étudiant', 'Mensuel', 'Ligne 5', 1200, 'en_attente', '2026-09-10', '2026-10-10'],
    ];
    const subscriptionEmails = new Set(data.abonnements.map((subscription) => subscription.userEmail));
    demoSubscriptions.forEach(([userPrenom, userNom, userEmail, titre, type, ligne, prix, status, dateDebut, dateFin]) => {
        if (!subscriptionEmails.has(userEmail)) data.abonnements.push({ id: generateId(), userPrenom, userNom, userEmail, ctt: userEmail, titre, type, ligne, prix, status, dateDebut, dateFin });
    });
    const aliSubscription = data.abonnements.find((subscription) => subscription.userEmail === 'ali.utilisateur@demo.com');
    if (aliSubscription) {
        aliSubscription.status = 'actif';
        aliSubscription.titre = 'Abonnement Standard';
        aliSubscription.type = 'Mensuel';
        aliSubscription.ligne = 'Ligne 4';
        aliSubscription.ligneArrivee = 'Tunis';
        aliSubscription.prix = 1200;
        aliSubscription.dateDebut = '2026-09-01';
        aliSubscription.dateFin = '2026-09-30';
    }
    return data;
};

const loadDemoData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const data = ensureDemoDensity(JSON.parse(stored));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return data;
        } catch (err) {
            console.warn('Données de démonstration corrompues, réinitialisation.', err);
        }
    }

    const data = ensureDemoDensity({ ...defaultData, utilisateurs: [...defaultData.utilisateurs], abonnements: [...defaultData.abonnements] });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
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
    const data = loadDemoData();

    const demoUser = roleKey === 'admin'
        ? data.utilisateurs.find((item) => item.role === 'admin') || data.utilisateurs[0]
        : data.utilisateurs.find((item) => item.role === 'utilisateur') || data.utilisateurs[0];

    const user = demoUser
        ? {
              ...demoUser,
              role: roleKey,
              email: demoUser.email,
          }
        : {
              id: generateId(),
              prenom: roleKey === 'admin' ? 'Admin' : 'Ahmed',
              nom: roleKey === 'admin' ? 'SRTB' : 'Ben Salah',
              email: roleKey === 'admin' ? email : 'ahmed.bensalah@example.com',
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
    return auth?.role === 'admin' ? '/dashboard' : '/subscription-types';
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
    const durationMonths = selectedType?.id === 'Annuel' || selectedType?.duration === '12 mois' ? 12
        : selectedType?.id === 'Trimestriel' || selectedType?.duration === '3 mois' ? 3
        : selectedType?.id === 'VIP' ? 12
        : selectedType?.id === 'Personnel' ? 1
        : 1;
    const basePrice = Number(selectedType?.basePrice || 1200);
    const durationDiscount = durationMonths >= 12 ? 0.96 : durationMonths >= 3 ? 0.94 : 1;
    const categoryRate = 1 + ((Number(lineId) || 1) - 1) * 0.03;
    const price = Math.round(basePrice * durationDiscount * categoryRate);
    return Promise.resolve({
        prix: price,
        tarifMensuel: basePrice,
        dureeMois: durationMonths,
        remiseDuree: durationDiscount,
        coefficientCategorie: categoryRate,
    });
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
        dateDebut: subscription.dateDebut || subscription.date_debut || formatDate(todayIso()),
        dateFin: subscription.dateFin || subscription.date_fin || formatDate(new Date(Date.now() + 30 * 86400000)),
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
        ['en_attente', 'pending', 'actif', 'validee', 'approved', 'refusee', 'rejected'].includes(subscription.status)
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
