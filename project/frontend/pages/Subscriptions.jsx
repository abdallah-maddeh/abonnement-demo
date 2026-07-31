import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { getCurrentUser, getSubscriptions, createSubscription, updateSubscription, deleteSubscription } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Filter, Edit2, Trash2, Package, CheckCircle2, AlertCircle } from 'lucide-react';

const statusLabels = {
    validee: 'Validé',
    actif: 'Actif',
    expire: 'Expiré',
};

const statusFilters = ['all', 'validee', 'actif', 'expire'];

const toDateOnly = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
};

const formatDisplayDate = (value) => {
    if (!value) return '-';
    return String(value).split('T')[0];
};

const toDateInputValue = (value) => {
    if (!value) return '';
    return String(value).split('T')[0];
};

const padDatePart = (value) => String(value).padStart(2, '0');

const getTodayInputValue = () => {
    const today = new Date();
    return [
        today.getFullYear(),
        padDatePart(today.getMonth() + 1),
        padDatePart(today.getDate()),
    ].join('-');
};

const parseDateInputValue = (value) => {
    const text = String(value || '').trim();
    const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const frMatch = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const match = isoMatch || frMatch;

    if (!match) {
        return null;
    }

    const year = Number(isoMatch ? match[1] : match[3]);
    const month = Number(isoMatch ? match[2] : match[2]);
    const day = Number(isoMatch ? match[3] : match[1]);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    date.setHours(0, 0, 0, 0);
    return date;
};

const addDaysToInputDate = (value, days) => {
    const date = parseDateInputValue(value);
    if (!date) return '';
    date.setDate(date.getDate() + days);
    return [
        date.getFullYear(),
        padDatePart(date.getMonth() + 1),
        padDatePart(date.getDate()),
    ].join('-');
};

const validateDateRange = (dateDebut, dateFin) => {
    const startDate = parseDateInputValue(dateDebut);
    const endDate = parseDateInputValue(dateFin);

    if (!startDate || !endDate) {
        return 'Veuillez saisir des dates valides.';
    }

    const today = parseDateInputValue(getTodayInputValue());
    if (startDate < today) {
        return "La date de debut doit etre aujourd'hui ou une date future.";
    }

    if (endDate <= startDate) {
        return 'La date de fin doit etre apres la date de debut.';
    }

    return '';
};

const getExpirationWarning = (item) => {
    const endDate = toDateOnly(item.dateFin);
    if (!endDate || !isValidatedSubscription(item)) {
        return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysLeft = Math.round((endDate.getTime() - today.getTime()) / 86400000);

    if (daysLeft === 7) {
        return { label: 'Expire dans 7 jours', background: '#FFF7ED', color: '#EA580C', border: '#FDBA74' };
    }

    if (daysLeft === 3) {
        return { label: 'Expire dans 3 jours', background: '#FEF3C7', color: '#B45309', border: '#FCD34D' };
    }

    if (daysLeft === 1) {
        return { label: 'Expire demain', background: '#FEE2E2', color: '#DC2626', border: '#FECACA' };
    }

    if (daysLeft === 0) {
        return { label: "Expire aujourd'hui", background: '#FEE2E2', color: '#DC2626', border: '#FECACA' };
    }

    if (daysLeft < 0) {
        return { label: 'Expiré', background: '#7F1D1D', color: '#FFFFFF', border: '#7F1D1D' };
    }

    return null;
};

const normalizeText = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const normalizeStatus = (value) => {
    const status = normalizeText(value);
    if (status.includes('expir')) return 'expire';
    if (status.includes('valid')) return 'validee';
    if (status.includes('actif')) return 'actif';
    return status;
};

const isValidatedSubscription = (item) => {
    const status = normalizeStatus(item.status);
    return status === 'validee' || status === 'actif';
};

const isExpiredByDate = (item) => {
    const endDate = toDateOnly(item.dateFin);
    if (!endDate || !isValidatedSubscription(item)) {
        return normalizeStatus(item.status) === 'expire';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate < today;
};

const getDisplayStatus = (item) => {
    if (isValidatedSubscription(item) && !isExpiredByDate(item)) {
        return 'actif';
    }

    if (isExpiredByDate(item)) {
        return 'expire';
    }

    return normalizeStatus(item.status);
};

const isVisibleAdminSubscription = (item) => {
    const status = getDisplayStatus(item);
    return status === 'validee' || status === 'actif' || status === 'expire';
};

const Subscriptions = () => {
    const user = getCurrentUser();
    const isAdmin = user?.role === 'admin';
    const [subscriptions, setSubscriptions] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [formData, setFormData] = useState({
        titre: '',
        type: 'Mensuel',
        ligne: 'Ligne 1',
        prix: 1200,
        dateDebut: '',
        dateFin: '',
        status: 'actif',
        userPrenom: '',
        userNom: '',
        userEmail: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [flippedCards, setFlippedCards] = useState({});
    const [userModalVisible, setUserModalVisible] = useState(false);
    const [userModalMode, setUserModalMode] = useState('create');
    const [userLoading, setUserLoading] = useState(false);
    const [userFormData, setUserFormData] = useState({
        id: '',
        type: 'Mensuel',
        ligne: 'Ligne 1',
        ligneArrivee: '',
        prix: 1200,
        dateDebut: '',
        dateFin: '',
        nom: '',
        prenom: '',
        ctt: '',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getSubscriptions();
                const items = data.subscriptions || [];
                setSubscriptions(isAdmin ? items.filter(isVisibleAdminSubscription) : items);
            } catch (err) {
                setError(err.message);
            }
        };

        load();
    }, [isAdmin]);

    const filteredSubscriptions = useMemo(() => {
        return subscriptions.filter((item) => {
            const searchText = [item.titre, item.type, item.ligne, item.userPrenom, item.userNom, item.userEmail]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            const matchesSearch = searchText.includes(search.toLowerCase());
            const matchesFilter = filter === 'all'
                || (filter === 'validee'
                    ? normalizeStatus(item.status) === 'validee'
                    : getDisplayStatus(item) === filter);
            return matchesSearch && matchesFilter;
        });
    }, [subscriptions, search, filter]);

    const stats = useMemo(() => {
        const validee = subscriptions.filter((item) => normalizeStatus(item.status) === 'validee').length;
        const actif = subscriptions.filter((item) => getDisplayStatus(item) === 'actif').length;
        const expire = subscriptions.filter((item) => getDisplayStatus(item) === 'expire').length;
        return { validee, actif, expire, total: subscriptions.length };
    }, [subscriptions]);

    const userActiveSubscriptions = useMemo(() => {
        if (isAdmin) {
            return [];
        }

        return subscriptions.filter((item) => {
            return getDisplayStatus(item) === 'actif';
        });
    }, [subscriptions, isAdmin]);

    const userSubscription = userActiveSubscriptions[0] || null;

    const buildSubscriptionQrData = (subscription) => {
        const status = getDisplayStatus(subscription);
        return [
            'Abonnement SRTB',
            `Nom : ${subscription.nom || subscription.userNom || '-'}`,
            `Prénom : ${subscription.prenom || subscription.userPrenom || '-'}`,
            `Contact : ${subscription.ctt || subscription.userEmail || '-'}`,
            `Type d'abonnement : ${subscription.type || '-'}`,
            `Ligne : ${subscription.ligne || '-'}`,
            `Date début : ${formatDisplayDate(subscription.dateDebut)}`,
            `Date fin : ${formatDisplayDate(subscription.dateFin)}`,
            `Statut : ${statusLabels[status] || status || '-'}`,
            `ID abonnement : ${subscription.id || '-'}`,
        ].join('\n');
    };

    const toggleCardFlip = (subscriptionId) => {
        setFlippedCards((current) => ({
            ...current,
            [subscriptionId]: !current[subscriptionId],
        }));
    };

    const openAddModal = () => {
        setSelectedSubscription(null);
        setFormData({
            titre: '',
            type: 'Mensuel',
            ligne: 'Ligne 1',
            prix: 1200,
            dateDebut: '',
            dateFin: '',
            status: 'actif',
            userPrenom: '',
            userNom: '',
            userEmail: '',
        });
        setError('');
        setSuccess('');
        setModalVisible(true);
    };

    const openEditModal = (subscription) => {
        setSelectedSubscription(subscription);
        setFormData({
            titre: subscription.titre || subscription.type || 'Abonnement',
            type: subscription.type || 'Mensuel',
            ligne: subscription.ligne || '',
            prix: subscription.prix || 0,
            dateDebut: toDateInputValue(subscription.dateDebut),
            dateFin: toDateInputValue(subscription.dateFin),
            status: subscription.status || 'actif',
            userPrenom: subscription.userPrenom || '',
            userNom: subscription.userNom || '',
            userEmail: subscription.userEmail || '',
        });
        setError('');
        setSuccess('');
        setModalVisible(true);
    };

    const handleSaveSubscription = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.ligne || !formData.dateDebut || !formData.dateFin) {
            setError('Veuillez renseigner la ligne et les dates.');
            setLoading(false);
            return;
        }

        const dateError = validateDateRange(formData.dateDebut, formData.dateFin);
        if (dateError) {
            setError(dateError);
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                titre: formData.titre || formData.type || 'Abonnement',
            };

            if (selectedSubscription) {
                const response = await updateSubscription(selectedSubscription.id, payload);
                setSubscriptions(subscriptions.map((item) => (item.id === selectedSubscription.id ? response.subscription : item)));
                setSuccess('Abonnement mis à jour.');
            } else {
                const response = await createSubscription(payload);
                setSubscriptions([response.subscription, ...subscriptions]);
                setSuccess('Abonnement créé.');
            }
            setModalVisible(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (subscription) => {
        setLoading(true);
        setError('');
        try {
            await deleteSubscription(subscription.id);
            setSubscriptions(subscriptions.filter((item) => item.id !== subscription.id));
            setSuccess('Abonnement supprimé.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openUserCreateModal = () => {
        setUserModalMode('create');
        setUserFormData({
            id: '',
            type: 'Mensuel',
            ligne: 'Ligne 1',
            ligneArrivee: '',
            prix: 1200,
            dateDebut: '',
            dateFin: '',
            nom: '',
            prenom: '',
            ctt: '',
        });
        setError('');
        setSuccess('');
        setUserModalVisible(true);
    };

    const openUserEditModal = (subscription) => {
        setUserModalMode('edit');
        setUserFormData({
            id: subscription.id,
            type: subscription.type,
            ligne: subscription.ligne,
            ligneArrivee: subscription.ligneArrivee || '',
            prix: subscription.prix,
            dateDebut: subscription.dateDebut,
            dateFin: subscription.dateFin,
            nom: subscription.nom || '',
            prenom: subscription.prenom || '',
            ctt: subscription.ctt || '',
        });
        setSelectedSubscription(subscription);
        setError('');
        setSuccess('');
        setUserModalVisible(true);
    };

    const handleUserSave = async (e) => {
        e.preventDefault();
        setUserLoading(true);
        setError('');
        setSuccess('');
        try {
            if (userModalMode === 'edit' && selectedSubscription) {
                // Send only editable fields: nom, prenom, ctt
                const payload = {
                    nom: userFormData.nom,
                    prenom: userFormData.prenom,
                    ctt: userFormData.ctt,
                };
                const response = await updateSubscription(selectedSubscription.id, payload);
                setSubscriptions(subscriptions.map((item) =>
                    item.id === selectedSubscription.id ? response.subscription : item
                ));
                setSuccess('Abonnement mis à jour.');
            } else {
                const response = await createSubscription(userFormData);
                setSubscriptions([response.subscription, ...subscriptions]);
                setSuccess('Abonnement créé avec succès.');
            }
            setUserModalVisible(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setUserLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', margin: 0 }}>
                        {isAdmin ? 'Abonnements plateforme' : 'Mon abonnement'}
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: '8px 0 0' }}>
                        {isAdmin
                            ? 'Suivez tous les abonnements de la plateforme avec une vue d\'administration claire.'
                            : 'Consultez et gérez votre abonnement actif.'}
                    </p>
                </div>
                {isAdmin ? (
                    <button
                        onClick={openAddModal}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: 'linear-gradient(135deg, #F97316, #EA580C)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.88';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        <Plus size={18} /> Ajouter un abonnement
                    </button>
                ) : !userSubscription ? (
                    <Link
                        to="/request-subscription"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: 'linear-gradient(135deg, #F97316, #EA580C)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.88';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        <Plus size={18} /> Demander un abonnement
                    </Link>
                ) : null}
            </div>

            {/* Stat Cards for Admin */}
            {isAdmin && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    {[
                        { label: 'Total abonnements', value: stats.total, icon: 'Package', bgColor: '#EFF6FF', color: '#3B82F6' },
                        { label: 'Validés', value: stats.validee, icon: 'CheckCircle2', bgColor: '#FFF7ED', color: '#F97316' },
                        { label: 'Actifs', value: stats.actif, icon: 'CheckCircle2', bgColor: '#ECFDF5', color: '#10B981' },
                        { label: 'Expirés', value: stats.expire, icon: 'AlertCircle', bgColor: '#FEF2F2', color: '#EF4444' },
                    ].map((stat) => {
                        const iconMap = {
                            Package: <Package size={24} />,
                            CheckCircle2: <CheckCircle2 size={24} />,
                            AlertCircle: <AlertCircle size={24} />
                        };
                        return (
                        <div
                            key={stat.label}
                            style={{
                                background: '#ffffff',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                border: '1px solid #F1F5F9'
                            }}
                        >
                            <div style={{
                                background: stat.bgColor,
                                borderRadius: '12px',
                                padding: '10px',
                                width: '44px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: stat.color,
                                marginBottom: '16px'
                            }}>
                                {iconMap[stat.icon]}
                            </div>
                            <p style={{
                                fontSize: '13px',
                                color: '#64748B',
                                margin: '0 0 8px'
                            }}>
                                {stat.label}
                            </p>
                            <h2 style={{
                                fontSize: '32px',
                                fontWeight: 800,
                                color: '#1E293B',
                                margin: 0
                            }}>
                                {stat.value}
                            </h2>
                        </div>
                    );
                    })}
                </div>
            )}

            {/* User Subscription View */}
            {!isAdmin ? (
                userActiveSubscriptions.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '18px',
                        alignItems: 'stretch'
                    }}>
                        {userActiveSubscriptions.map((userSubscription) => {
                            const isFlipped = Boolean(flippedCards[userSubscription.id]);
                            const displayStatus = getDisplayStatus(userSubscription);
                            const expirationWarning = getExpirationWarning(userSubscription);

                            return (
                    <div
                        key={userSubscription.id}
                        onClick={() => toggleCardFlip(userSubscription.id)}
                        style={{
                        perspective: '1200px',
                        minHeight: '430px',
                        cursor: 'pointer'
                    }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        minHeight: '430px',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.65s ease',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}>
                    <div style={{
                        background: '#ffffff',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '12px',
                        padding: '22px',
                        minHeight: '430px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 2px 10px rgba(15,23,42,0.07)',
                        border: '1px solid #E2E8F0',
                        backfaceVisibility: 'hidden'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '16px',
                            marginBottom: '18px',
                            paddingBottom: '18px',
                            borderBottom: '1px solid #F1F5F9'
                        }}>
                            <div>
                                <span style={{
                                    display: 'inline-block',
                                    background: '#FFF7ED',
                                    color: '#F97316',
                                    border: '1px solid #FDBA74',
                                    borderRadius: '6px',
                                    padding: '4px 12px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    marginBottom: '12px'
                                }}>
                                    Type d'abonnement
                                </span>
                                <h2 style={{
                                    fontSize: '20px',
                                    fontWeight: 700,
                                    color: '#1E293B',
                                    margin: '0 0 8px'
                                }}>
                                    {userSubscription.type || userSubscription.titre}
                                </h2>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#64748B',
                                    margin: 0
                                }}>
                                    {userSubscription.ligne}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{
                                    fontSize: '20px',
                                    fontWeight: 700,
                                    color: '#1E293B',
                                    margin: '0 0 8px'
                                }}>
                                    {Number(userSubscription.prix || 0).toFixed(2)} TND
                                </p>
                                <span style={{
                                    display: 'inline-block',
                                    background: displayStatus === 'actif' ? '#F0FDF4' : '#FEF2F2',
                                    color: displayStatus === 'actif' ? '#16A34A' : '#DC2626',
                                    border: displayStatus === 'actif' ? '1px solid #86EFAC' : '1px solid #FECACA',
                                    borderRadius: '20px',
                                    padding: '4px 12px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    {statusLabels[displayStatus]}
                                </span>
                                {expirationWarning && (
                                    <span style={{
                                        display: 'inline-block',
                                        marginTop: '8px',
                                        background: expirationWarning.background,
                                        color: expirationWarning.color,
                                        border: `1px solid ${expirationWarning.border}`,
                                        borderRadius: '20px',
                                        padding: '4px 12px',
                                        fontSize: '12px',
                                        fontWeight: '700'
                                    }}>
                                        {expirationWarning.label}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    title="Modifier nom, prenom et contact"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openUserEditModal(userSubscription);
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        marginTop: '10px',
                                        padding: '7px 12px',
                                        background: '#EEF2FF',
                                        color: '#6366F1',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#6366F1';
                                        e.currentTarget.style.color = '#ffffff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#EEF2FF';
                                        e.currentTarget.style.color = '#6366F1';
                                    }}
                                >
                                    <Edit2 size={14} />
                                    Modifier
                                </button>
                            </div>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '14px',
                            marginBottom: '14px'
                        }}>
                            <div>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#64748B',
                                    display: 'block',
                                    marginBottom: '4px'
                                }}>ID Abonnement</span>
                                <strong style={{
                                    fontSize: '14px',
                                    color: '#1E293B'
                                }}>{userSubscription.id}</strong>
                            </div>
                            <div>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#64748B',
                                    display: 'block',
                                    marginBottom: '4px'
                                }}>Nom</span>
                                <strong style={{
                                    fontSize: '14px',
                                    color: '#1E293B'
                                }}>{userSubscription.nom || '-'}</strong>
                            </div>
                            <div>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#64748B',
                                    display: 'block',
                                    marginBottom: '4px'
                                }}>Prénom</span>
                                <strong style={{
                                    fontSize: '14px',
                                    color: '#1E293B'
                                }}>{userSubscription.prenom || '-'}</strong>
                            </div>
                            <div>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#64748B',
                                    display: 'block',
                                    marginBottom: '4px'
                                }}>Contact</span>
                                <strong style={{
                                    fontSize: '14px',
                                    color: '#1E293B'
                                }}>{userSubscription.ctt || '-'}</strong>
                            </div>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '14px',
                            marginTop: 'auto',
                            paddingTop: '14px',
                            borderTop: '1px solid #F1F5F9'
                        }}>
                            <div>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#64748B',
                                    display: 'block',
                                    marginBottom: '4px'
                                }}>Ligne Départ</span>
                                <strong style={{
                                    fontSize: '14px',
                                    color: '#1E293B'
                                }}>{userSubscription.ligne}</strong>
                            </div>
                            <div>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#64748B',
                                    display: 'block',
                                    marginBottom: '4px'
                                }}>Ligne Arrivée</span>
                                <strong style={{
                                    fontSize: '14px',
                                    color: '#1E293B'
                                }}>{userSubscription.ligneArrivee || '-'}</strong>
                            </div>
                            <div>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#64748B',
                                    display: 'block',
                                    marginBottom: '4px'
                                }}>Date début</span>
                                <strong style={{
                                    fontSize: '14px',
                                    color: '#1E293B'
                                }}>{formatDisplayDate(userSubscription.dateDebut)}</strong>
                            </div>
                            <div>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#64748B',
                                    display: 'block',
                                    marginBottom: '4px'
                                }}>Date fin</span>
                                <strong style={{
                                    fontSize: '14px',
                                    color: '#1E293B'
                                }}>{formatDisplayDate(userSubscription.dateFin)}</strong>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, #ffffff 0%, #FFF7ED 100%)',
                        borderRadius: '12px',
                        padding: '24px',
                        minHeight: '430px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                        boxShadow: '0 2px 10px rgba(15,23,42,0.07)',
                        border: '1px solid #FDBA74',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}>
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '10px',
                            padding: '14px',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 8px 22px rgba(15,23,42,0.08)'
                        }}>
                            <QRCodeCanvas
                                value={buildSubscriptionQrData(userSubscription)}
                                size={180}
                                includeMargin
                            />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{
                                fontSize: '18px',
                                color: '#1E293B',
                                fontWeight: 700,
                                margin: '0 0 6px'
                            }}>
                                Carte abonnement SRTB
                            </h3>
                            <p style={{
                                fontSize: '13px',
                                color: '#64748B',
                                margin: 0
                            }}>
                                Scanner pour afficher les informations
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleCardFlip(userSubscription.id);
                            }}
                            style={{
                                padding: '9px 18px',
                                background: '#F97316',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(249,115,22,0.24)'
                            }}
                        >
                            Retour
                        </button>
                    </div>
                    </div>
                    </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        padding: '40px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: '1px solid #E2E8F0'
                    }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', margin: '0 0 10px' }}>Aucun abonnement actif</h3>
                        <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>Votre abonnement n'a pas encore été trouvé. Envoyez une demande pour qu'un administrateur l'examine.</p>
                    </div>
                )
            ) : (
                <>
                    {/* Search and Filter */}
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '24px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            position: 'relative',
                            flex: 1,
                            minWidth: '300px'
                        }}>
                            <Filter size={18} style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9CA3AF'
                            }} />
                            <input
                                type="search"
                                placeholder="Rechercher un abonnement..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px 10px 40px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {statusFilters.map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFilter(status)}
                                    style={{
                                        padding: '8px 16px',
                                        background: filter === status ? '#F97316' : '#f3f4f6',
                                        color: filter === status ? '#ffffff' : '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (filter !== status) {
                                            e.currentTarget.style.background = '#e5e7eb';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (filter !== status) {
                                            e.currentTarget.style.background = '#f3f4f6';
                                        }
                                    }}
                                >
                                    {status === 'all' ? 'Tous' : statusLabels[status]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div style={{
                            background: '#FEE2E2',
                            border: '1px solid #FECACA',
                            color: '#DC2626',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '13px'
                        }}>
                            ✕ {error}
                        </div>
                    )}
                    {success && (
                        <div style={{
                            background: '#DBEAFE',
                            border: '1px solid #BFDBFE',
                            color: '#1E40AF',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '13px'
                        }}>
                            ✓ {success}
                        </div>
                    )}

                    {/* Table */}
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '14px'
                            }}>
                                <thead>
                                    <tr style={{
                                        background: '#FFF7ED',
                                        borderBottom: '1px solid #E2E8F0'
                                    }}>
                                        <th style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#F97316'
                                        }}>Titre</th>
                                        <th style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#F97316'
                                        }}>Type</th>
                                        <th style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#F97316'
                                        }}>Utilisateur</th>
                                        <th style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#F97316'
                                        }}>Dates</th>
                                        <th style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#F97316'
                                        }}>Statut</th>
                                        <th style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#F97316'
                                        }}>Prix</th>
                                        <th style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#F97316'
                                        }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubscriptions.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{
                                                padding: '40px',
                                                textAlign: 'center',
                                                color: '#9CA3AF'
                                            }}>
                                                Aucun abonnement trouvé
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubscriptions.map((item) => (
                                            <tr key={item.id} style={{
                                                borderBottom: '1px solid #F8FAFC',
                                                transition: 'background 0.2s ease'
                                            }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#FFFBF7'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '16px', color: '#1F2937', fontWeight: '500' }}>
                                                    {item.titre}
                                                </td>
                                                <td style={{ padding: '16px', color: '#6B7280' }}>
                                                    {item.type}
                                                </td>
                                                <td style={{ padding: '16px', color: '#6B7280', fontSize: '13px' }}>
                                                    {item.userPrenom} {item.userNom}
                                                </td>
                                                <td style={{ padding: '16px', color: '#6B7280', fontSize: '13px' }}>
                                                    {formatDisplayDate(item.dateDebut)} → {formatDisplayDate(item.dateFin)}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        background: getDisplayStatus(item) === 'actif' ? '#F0FDF4' : '#FEF2F2',
                                                        color: getDisplayStatus(item) === 'actif' ? '#16A34A' : '#DC2626',
                                                        border: getDisplayStatus(item) === 'actif' ? '1px solid #86EFAC' : '1px solid #FECACA'
                                                    }}>
                                                        {statusLabels[getDisplayStatus(item)]}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', color: '#1F2937', fontWeight: '500' }}>
                                                    {Number(item.prix || 0).toFixed(2)} TND
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                padding: '7px 14px',
                                                                background: '#EEF2FF',
                                                                color: '#6366F1',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#6366F1';
                                                                e.currentTarget.style.color = '#ffffff';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = '#EEF2FF';
                                                                e.currentTarget.style.color = '#6366F1';
                                                            }}
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                padding: '7px 14px',
                                                                background: '#FEF2F2',
                                                                color: '#DC2626',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#DC2626';
                                                                e.currentTarget.style.color = '#ffffff';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = '#FEF2F2';
                                                                e.currentTarget.style.color = '#DC2626';
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                title={selectedSubscription ? 'Modifier l\'abonnement' : 'Ajouter un abonnement'}
                onClose={() => setModalVisible(false)}
            >
                <form noValidate onSubmit={handleSaveSubscription} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>Titre</label>
                            <input
                                type="text"
                                value={formData.titre}
                                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <option>Mensuel</option>
                                <option>Annuel</option>
                                <option>Étudiant</option>
                                <option>Professionnel</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>Ligne</label>
                            <input
                                type="text"
                                value={formData.ligne}
                                onChange={(e) => setFormData({ ...formData, ligne: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>Prix</label>
                            <input
                                type="number"
                                value={formData.prix}
                                onChange={(e) => setFormData({ ...formData, prix: Number(e.target.value) })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>Date début</label>
                            <input
                                type="date"
                                value={formData.dateDebut}
                                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                                required
                                min={getTodayInputValue()}
                                max={addDaysToInputDate(formData.dateFin, -1) || undefined}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>Date fin</label>
                            <input
                                type="date"
                                value={formData.dateFin}
                                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                                required
                                min={addDaysToInputDate(formData.dateDebut, 1) || undefined}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>Statut</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <option value="actif">Actif</option>
                                <option value="expire">Expiré</option>
                            </select>
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>Nom utilisateur</label>
                            <input
                                type="text"
                                value={formData.userNom}
                                onChange={(e) => setFormData({ ...formData, userNom: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>Prénom utilisateur</label>
                            <input
                                type="text"
                                value={formData.userPrenom}
                                onChange={(e) => setFormData({ ...formData, userPrenom: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>Email utilisateur</label>
                            <input
                                type="email"
                                value={formData.userEmail}
                                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                            type="button"
                            onClick={() => setModalVisible(false)}
                            style={{
                                padding: '10px 20px',
                                background: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                background: loading ? '#FDBF8A' : '#F97316',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.opacity = '0.88';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                            }}
                        >
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* User Modal */}
            <Modal
                visible={userModalVisible}
                title={userModalMode === 'create' ? 'Demande d abonnement' : 'Modifier mon abonnement'}
                onClose={() => setUserModalVisible(false)}
            >
                <form onSubmit={handleUserSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* EDIT MODE: Non-modifiable fields */}
                    {userModalMode === 'edit' && (
                        <>
                            <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px 16px', border: '1px solid #E2E8F0' }}>
                                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 8px', fontWeight: 600 }}>
                                    INFORMATIONS NON MODIFIABLES
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>ID</span>
                                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{userFormData.id}</span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Type</span>
                                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{userFormData.type}</span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Prix (TND)</span>
                                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{userFormData.prix.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Ligne Départ</span>
                                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{userFormData.ligne}</span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Ligne Arrivée</span>
                                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{userFormData.ligneArrivee || '-'}</span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Date début</span>
                                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{formatDisplayDate(userFormData.dateDebut)}</span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Date fin</span>
                                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{formatDisplayDate(userFormData.dateFin)}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* CREATE MODE: All editable fields */}
                    {userModalMode === 'create' && (
                        <>
                            {/* Type */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Type d'abonnement
                                </label>
                                <select
                                    value={userFormData.type}
                                    onChange={(e) => setUserFormData({ ...userFormData, type: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <option>Mensuel</option>
                                    <option>Annuel</option>
                                    <option>Étudiant</option>
                                    <option>Professionnel</option>
                                </select>
                            </div>

                            {/* Ligne Départ et Ligne Arrivée */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                        Ligne Départ
                                    </label>
                                    <input
                                        type="text"
                                        value={userFormData.ligne}
                                        onChange={(e) => setUserFormData({ ...userFormData, ligne: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                                        onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                        Ligne Arrivée
                                    </label>
                                    <input
                                        type="text"
                                        value={userFormData.ligneArrivee}
                                        onChange={(e) => setUserFormData({ ...userFormData, ligneArrivee: e.target.value })}
                                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                                        onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Prix */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Prix (TND)
                                </label>
                                <input
                                    type="number"
                                    value={userFormData.prix}
                                    onChange={(e) => setUserFormData({ ...userFormData, prix: Number(e.target.value) })}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>

                            {/* Dates */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                        Date début
                                    </label>
                                    <input
                                        type="date"
                                        value={userFormData.dateDebut}
                                        onChange={(e) => setUserFormData({ ...userFormData, dateDebut: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                                        onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                        Date fin
                                    </label>
                                    <input
                                        type="date"
                                        value={userFormData.dateFin}
                                        onChange={(e) => setUserFormData({ ...userFormData, dateFin: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                                        onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ALWAYS EDITABLE: Nom, Prénom, Contact */}
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px', fontWeight: 600, textTransform: 'uppercase' }}>
                            INFORMATIONS MODIFIABLES
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={userFormData.nom}
                                    onChange={(e) => setUserFormData({ ...userFormData, nom: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    value={userFormData.prenom}
                                    onChange={(e) => setUserFormData({ ...userFormData, prenom: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                Contact (CTT)
                            </label>
                            <input
                                type="text"
                                value={userFormData.ctt}
                                onChange={(e) => setUserFormData({ ...userFormData, ctt: e.target.value })}
                                required
                                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: '13px', borderRadius: '8px', padding: '10px 14px' }}>
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                        <button
                            type="button"
                            onClick={() => setUserModalVisible(false)}
                            style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={userLoading}
                            style={{
                                padding: '10px 20px',
                                background: userLoading ? '#FDBF8A' : '#F97316',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: userLoading ? 'not-allowed' : 'pointer'
                            }}
                            onMouseEnter={(e) => { if (!userLoading) e.currentTarget.style.opacity = '0.88'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                        >
                            {userLoading ? 'Enregistrement...' : userModalMode === 'create' ? 'Envoyer' : 'Sauvegarder'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Subscriptions;
