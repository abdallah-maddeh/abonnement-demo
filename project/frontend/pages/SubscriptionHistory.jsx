import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, History, MapPin, SlidersHorizontal } from 'lucide-react';
import { getCurrentUser, getSubscriptions } from '../services/api';
import { EmptyState, FilterBar, PageHeader, StatusBadge } from '../components/PremiumUI';

const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const displayDate = (value) => value ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const statusFor = (item) => {
    const end = new Date(item.dateFin);
    if (normalize(item.status).includes('attente') || item.status === 'pending') return 'en_attente';
    if (normalize(item.status).includes('refus')) return 'refusee';
    if (['actif', 'validee'].includes(normalize(item.status)) && end >= new Date()) return 'actif';
    return 'expire';
};

const SubscriptionHistory = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = getCurrentUser();

    useEffect(() => {
        getSubscriptions().then((result) => setItems(result.subscriptions || [])).catch((err) => setError(err.message || 'Impossible de charger votre historique.')).finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => items.filter((item) => {
        const status = statusFor(item);
        const text = normalize([item.titre, item.type, item.ligne, item.userEmail].join(' '));
        return text.includes(normalize(search)) && (filter === 'all' || status === filter);
    }).sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut)), [items, search, filter]);

    return <div className="page-shell">
        <PageHeader eyebrow="Espace passager" title="Historique des abonnements" subtitle="Retrouvez vos demandes, vos périodes de validité et vos anciens abonnements." />
        <FilterBar search={search} onSearch={setSearch} placeholder="Rechercher un abonnement ou une ligne..."><div className="filter-select-wrap"><SlidersHorizontal size={15} /><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filtrer par statut"><option value="all">Tous les statuts</option><option value="actif">Actifs</option><option value="en_attente">En attente</option><option value="expire">Expirés</option><option value="refusee">Refusés</option></select></div></FilterBar>
        {error && <div className="error-message">{error}</div>}
        {loading ? <div className="history-premium-list"><div className="premium-skeleton" /><div className="premium-skeleton" /><div className="premium-skeleton" /></div> : filtered.length === 0 ? <EmptyState icon={<History size={23} />} title="Aucun historique trouvé" description={user ? 'Vos demandes et abonnements apparaîtront ici.' : 'Connectez-vous pour consulter votre historique.'} /> : <div className="history-premium-list">{filtered.map((item) => { const status = statusFor(item); return <article className="history-premium-row" key={item.id}><div className="history-date-block"><CalendarDays size={17} /><span>{displayDate(item.dateDebut)}</span></div><div className="history-main"><div className="history-title-line"><h2>{item.titre || item.type || 'Abonnement'}</h2><StatusBadge status={status} /></div><p><MapPin size={14} /> {item.ligne || 'Ligne non précisée'} {item.ligneArrivee ? `· ${item.ligneArrivee}` : ''}</p><small><Clock3 size={13} /> {displayDate(item.dateDebut)} — {displayDate(item.dateFin)}</small></div><strong className="history-price">{Number(item.prix || 0).toLocaleString('fr-FR')} TND</strong></article>; })}</div>}
    </div>;
};

export default SubscriptionHistory;
