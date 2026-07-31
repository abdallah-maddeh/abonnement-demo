import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getSubscriptions } from '../services/api';
import { AlertCircle, CheckCircle, Clock3, MapPin } from 'lucide-react';

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

const isValidatedSubscription = (item) => item.status === 'validee' || item.status === 'actif';
const isPendingSubscription = (item) => item.status === 'en_attente' || item.status === 'pending';

const isExpiredSubscription = (item) => {
    const endDate = toDateOnly(item.dateFin);
    if (!endDate || !isValidatedSubscription(item)) {
        return item.status === 'expiré' || item.status === 'expirÃ©';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate < today;
};

const isActiveSubscription = (item) => isValidatedSubscription(item) && !isExpiredSubscription(item);

const getHistoryStatus = (item) => {
    if (isPendingSubscription(item)) {
        return {
            label: 'En attente',
            className: 'status-badge',
            style: { background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' },
            icon: <Clock3 size={20} />,
        };
    }

    if (isActiveSubscription(item)) {
        return {
            label: 'Actif',
            className: 'status-badge status-actif',
            style: undefined,
            icon: <CheckCircle size={20} />,
        };
    }

    return {
        label: 'Expire',
        className: 'status-badge status-expiré',
        style: undefined,
        icon: <AlertCircle size={20} />,
    };
};

const SubscriptionHistory = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const loadHistory = async () => {
            try {
                const data = await getSubscriptions();
                const allSubscriptions = data.subscriptions || [];
                setHistory([...allSubscriptions].sort((a, b) => {
                    return new Date(b.dateDebut || 0) - new Date(a.dateDebut || 0);
                }));
            } catch (err) {
                setError(err.message);
            }
        };

        loadHistory();
    }, [navigate]);

    return (
        <div className="page-shell">
            <div className="page-header">
                <div>
                    <h1>Historique des abonnements</h1>
                    <p>Vos demandes en attente, abonnements actifs et abonnements expires sont affiches ici.</p>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="history-grid timeline-grid">
                {history.length === 0 && !error ? (
                    <div className="empty-card">
                        <h3>Aucun historique</h3>
                        <p>Aucune demande ou abonnement n'a encore ete trouve.</p>
                    </div>
                ) : history.map((item) => {
                    const status = getHistoryStatus(item);
                    const price = Number(item.prix || 0);

                    return (
                        <article key={item.id} className="history-card timeline-card">
                            <div className="history-card-top">
                                <div>
                                    <span className={status.className} style={status.style}>
                                        {status.label}
                                    </span>
                                    <h3>{item.titre || item.type || 'Abonnement'}</h3>
                                </div>
                                <div className="history-icon">
                                    {status.icon}
                                </div>
                            </div>

                            <div className="history-row">
                                <MapPin size={16} />
                                <span>{item.ligne || '-'}</span>
                            </div>
                            <div className="history-row">
                                <Clock3 size={16} />
                                <span>{formatDisplayDate(item.dateDebut)} - {formatDisplayDate(item.dateFin)}</span>
                            </div>
                            <div className="history-row">
                                <span className="history-label">Type</span>
                                <strong>{item.type || '-'}</strong>
                            </div>
                            <div className="history-row">
                                <span className="history-label">Prix</span>
                                <strong>{price.toFixed(2)} TND</strong>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default SubscriptionHistory;
