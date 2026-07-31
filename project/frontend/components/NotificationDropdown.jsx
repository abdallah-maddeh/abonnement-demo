import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { getCurrentUser, getSubscriptions } from '../services/api';

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value).split('T')[0];
    }

    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const toDateOnly = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
};

const getDaysLeft = (dateFin) => {
    const endDate = toDateOnly(dateFin);
    if (!endDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((endDate.getTime() - today.getTime()) / 86400000);
};

const getExpirationNotification = (subscription) => {
    const daysLeft = getDaysLeft(subscription.dateFin);
    if (daysLeft === null) return null;

    let message = '';
    let key = '';

    if (daysLeft === 7) {
        key = '7';
        message = 'Votre abonnement expire dans 7 jours. Pensez a le renouveler.';
    } else if (daysLeft === 3) {
        key = '3';
        message = 'Votre abonnement expire dans 3 jours. Pensez a le renouveler.';
    } else if (daysLeft === 1) {
        key = '1';
        message = 'Votre abonnement expire demain.';
    } else if (daysLeft === 0) {
        key = '0';
        message = "Votre abonnement expire aujourd'hui.";
    } else if (daysLeft < 0) {
        key = 'expired';
        message = 'Votre abonnement est expire. Veuillez le renouveler.';
    } else {
        return null;
    }

    return {
        id: `expiration-${subscription.id}-${key}`,
        titre: 'Expiration abonnement',
        message,
        statut: 'non_lue',
        dateCreation: new Date().toISOString(),
    };
};

const NotificationDropdown = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const user = getCurrentUser();
    const storagePrefix = `notifications:${user?.email || user?.id || 'guest'}`;

    const getStoredIds = (type) => {
        try {
            return JSON.parse(localStorage.getItem(`${storagePrefix}:${type}`) || '[]');
        } catch (err) {
            return [];
        }
    };

    const setStoredIds = (type, ids) => {
        localStorage.setItem(`${storagePrefix}:${type}`, JSON.stringify([...new Set(ids)]));
    };

    const unreadCount = useMemo(() => (
        notifications.filter((item) => item.statut !== 'lue').length
    ), [notifications]);

    const loadNotifications = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getSubscriptions();
            const readIds = getStoredIds('read');
            const deletedIds = getStoredIds('deleted');
            const generatedNotifications = (data.subscriptions || [])
                .filter((subscription) => subscription.status === 'validee' || subscription.status === 'actif')
                .map(getExpirationNotification)
                .filter(Boolean)
                .filter((notification) => !deletedIds.includes(notification.id))
                .map((notification) => ({
                    ...notification,
                    statut: readIds.includes(notification.id) ? 'lue' : 'non_lue',
                }));

            setNotifications(generatedNotifications);
        } catch (err) {
            setError(err.message || 'Erreur chargement notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleRead = (id) => {
        setStoredIds('read', [...getStoredIds('read'), id]);
        setNotifications((items) => items.map((item) => (
            item.id === id ? { ...item, statut: 'lue' } : item
        )));
    };

    const handleDelete = (id) => {
        setStoredIds('deleted', [...getStoredIds('deleted'), id]);
        setNotifications((items) => items.filter((item) => item.id !== id));
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                    setOpen((current) => !current);
                    if (!open) {
                        loadNotifications();
                    }
                }}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    transition: 'color 0.2s ease',
                    position: 'relative',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#F97316'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        minWidth: 18,
                        height: 18,
                        padding: '0 5px',
                        borderRadius: 999,
                        background: '#DC2626',
                        color: '#ffffff',
                        fontSize: 10,
                        fontWeight: 700,
                        display: 'grid',
                        placeItems: 'center',
                        border: '2px solid #ffffff',
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: '42px',
                    right: 0,
                    width: 360,
                    maxWidth: 'calc(100vw - 24px)',
                    background: '#ffffff',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    boxShadow: '0 16px 40px rgba(15,23,42,0.14)',
                    zIndex: 20,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid #F1F5F9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <strong style={{ fontSize: 14, color: '#1E293B' }}>Notifications</strong>
                        <span style={{ fontSize: 12, color: '#64748B' }}>{unreadCount} non lue(s)</span>
                    </div>

                    {error && (
                        <div style={{
                            margin: 12,
                            padding: '10px 12px',
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            color: '#B91C1C',
                            borderRadius: 8,
                            fontSize: 12,
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: 18, color: '#64748B', fontSize: 13 }}>Chargement...</div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: 18, color: '#64748B', fontSize: 13 }}>Aucune notification.</div>
                        ) : notifications.map((notification) => {
                            const unread = notification.statut !== 'lue';
                            return (
                                <div
                                    key={notification.id}
                                    style={{
                                        padding: '14px 16px',
                                        borderBottom: '1px solid #F8FAFC',
                                        background: unread ? '#FFF7ED' : '#ffffff',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <strong style={{ display: 'block', fontSize: 13, color: '#1E293B', marginBottom: 4 }}>
                                                {notification.titre}
                                            </strong>
                                            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: '#475569' }}>
                                                {notification.message}
                                            </p>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                                                <span style={{ fontSize: 11, color: '#64748B' }}>
                                                    {formatDate(notification.dateCreation)}
                                                </span>
                                                <span style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: unread ? '#F97316' : '#16A34A',
                                                    textTransform: 'uppercase',
                                                }}>
                                                    {unread ? 'Non lue' : 'Lue'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                            {unread && (
                                                <button
                                                    type="button"
                                                    title="Marquer comme lue"
                                                    onClick={() => handleRead(notification.id)}
                                                    style={iconButtonStyle}
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                title="Supprimer"
                                                onClick={() => handleDelete(notification.id)}
                                                style={iconButtonStyle}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const iconButtonStyle = {
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    border: 'none',
    borderRadius: 8,
    background: '#F1F5F9',
    color: '#475569',
    cursor: 'pointer',
};

export default NotificationDropdown;
