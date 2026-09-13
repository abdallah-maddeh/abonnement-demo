import { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Eye, FileClock, Search, X, XCircle } from 'lucide-react';
import { getSubscriptionRequests, getSubscription, validateSubscription, refuseSubscription, deleteSubscription } from '../services/api';
import Modal from '../components/Modal';
import { Avatar, PageHeader, StatCard, StatusBadge } from '../components/PremiumUI';

const normalize = (value) => String(value || '').toLowerCase();

const SubscriptionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(false);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const load = () => {
        setLoading(true);
        getSubscriptionRequests()
            .then((result) => setRequests(result.requests || []))
            .catch((err) => setError(err.message || 'Impossible de charger les demandes.'))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const filtered = useMemo(() => requests.filter((item) => normalize([item.id, item.userNom, item.userPrenom, item.type, item.ligne].join(' ')).includes(normalize(search))), [requests, search]);
    const pending = requests.filter((item) => ['en_attente', 'pending'].includes(item.status)).length;
    const approved = requests.filter((item) => ['actif', 'validee', 'approved'].includes(item.status)).length;
    const refused = requests.filter((item) => ['refusee', 'rejected'].includes(item.status)).length;

    const openDetail = async (item) => {
        try {
            const result = await getSubscription(item.id);
            setSelected(result.subscription || item);
        } catch {
            setSelected(item);
        }
        setDetail(true);
    };

    const action = async (handler, success) => {
        if (!selected) return;
        setActionLoading(true);
        try {
            const result = await handler(selected.id);
            setRequests((items) => items.map((item) => item.id === selected.id ? result.subscription : item));
            setSelected(result.subscription);
            setMessage(success);
        } catch (err) {
            setError(err.message || 'Action impossible.');
        } finally {
            setActionLoading(false);
        }
    };

    const remove = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await deleteSubscription(selected.id);
            setRequests((items) => items.filter((item) => item.id !== selected.id));
            setDetail(false);
            setMessage('Demande supprimée.');
        } catch (err) {
            setError(err.message || 'Suppression impossible.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="page-shell">
            <PageHeader eyebrow="Administration" title="Demandes d’abonnements" subtitle="Examinez et traitez les demandes envoyées par les utilisateurs SRTB." />
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            <div className="admin-stats">
                <StatCard icon={<FileClock size={17} />} label="Nouvelles demandes" value={requests.length} hint="File de traitement" />
                <StatCard icon={<Search size={17} />} label="En attente" value={pending} hint="À examiner" tone="amber" />
                <StatCard icon={<CheckCircle2 size={17} />} label="Approuvées" value={approved} hint="Décisions positives" tone="teal" />
                <StatCard icon={<XCircle size={17} />} label="Refusées" value={refused} hint="Décisions négatives" tone="slate" />
            </div>
            <div className="premium-filterbar"><label className="premium-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une demande, un utilisateur ou une ligne..." aria-label="Rechercher une demande" /></label><span className="table-result-count">{filtered.length} demande{filtered.length > 1 ? 's' : ''}</span></div>
            <div className="surface admin-table-wrap">
                {loading ? <div className="premium-skeleton" /> : <table className="premium-table"><thead><tr><th>ID</th><th>Utilisateur</th><th>Abonnement</th><th>Ligne</th><th>Période</th><th>Statut</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><strong className="request-code">{item.id}</strong></td><td><div className="table-person"><Avatar name={`${item.userPrenom || item.prenom || ''} ${item.userNom || item.nom || ''}`} size="sm" /><strong>{item.userPrenom || item.prenom} {item.userNom || item.nom}</strong></div></td><td>{item.type || item.titre || '-'}</td><td>{item.ligne || '-'}</td><td>{item.dateDebut || '-'} → {item.dateFin || '-'}</td><td><StatusBadge status={item.status} /></td><td><button className="table-text-action" type="button" onClick={() => openDetail(item)}><Eye size={14} /> Voir</button></td></tr>)}</tbody></table>}
            </div>
            <Modal visible={detail} title="Détail de la demande" onClose={() => setDetail(false)} actions={selected && <><button className="btn-secondary" type="button" onClick={remove} disabled={actionLoading}><X size={14} /> Supprimer</button>{['en_attente', 'pending'].includes(selected.status) && <><button className="btn-secondary" type="button" onClick={() => action(refuseSubscription, 'Demande refusée.')} disabled={actionLoading}><XCircle size={14} /> Refuser</button><button className="btn-primary" type="button" onClick={() => action(validateSubscription, 'Demande approuvée.')} disabled={actionLoading}><Check size={14} /> Approuver</button></>}</>}>
                {selected && <div className="request-detail"><div className="request-detail-user"><Avatar name={`${selected.userPrenom || selected.prenom || ''} ${selected.userNom || selected.nom || ''}`} size="md" /><div><strong>{selected.userPrenom || selected.prenom} {selected.userNom || selected.nom}</strong><small>{selected.userEmail || selected.ctt}</small></div></div><div className="detail-grid"><div><span>Type</span><strong>{selected.type || selected.titre}</strong></div><div><span>Ligne</span><strong>{selected.ligne}</strong></div><div><span>Période</span><strong>{selected.dateDebut} → {selected.dateFin}</strong></div><div><span>Prix</span><strong>{Number(selected.prix || 0).toLocaleString('fr-FR')} TND</strong></div></div><StatusBadge status={selected.status} /></div>}
            </Modal>
        </div>
    );
};

export default SubscriptionRequests;
