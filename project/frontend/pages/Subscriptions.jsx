import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Building2, CalendarCheck, CalendarDays, CalendarRange, CheckCircle2, Clock3, Crown, Download, Edit3, GraduationCap, Layers3, MapPin, Plus, QrCode, School, Search, Trash2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { createSubscription, deleteSubscription, getCurrentUser, getSubscriptions, updateSubscription } from '../services/api';
import Modal from '../components/Modal';
import { EmptyState, FilterBar, PageHeader, StatCard, StatusBadge } from '../components/PremiumUI';

const dateValue = (value) => value ? new Date(value) : null;
const dateLabel = (value) => value ? dateValue(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const normalizedStatus = (item) => { const end = dateValue(item.dateFin); if (['actif', 'validee'].includes(String(item.status).toLowerCase()) && end && end >= new Date()) return 'actif'; return String(item.status || 'expire').toLowerCase(); };
const validity = (item) => { const start = dateValue(item.dateDebut); const end = dateValue(item.dateFin); const now = new Date(); if (!start || !end) return { percent: 0, days: 0 }; const total = Math.max(end - start, 1); const used = Math.min(Math.max(now - start, 0), total); return { percent: Math.round((used / total) * 100), days: Math.max(Math.ceil((end - now) / 86400000), 0) }; };

export const subscriptionCatalogFallback = [
    {
        id: 'Scolaire',
        title: 'Abonnement Scolaire',
        description: 'Une formule adaptée aux déplacements quotidiens des élèves, avec des trajets simples et fiables.',
        eligibility: 'Élèves',
        duration: '1 mois',
        price: '15 DT',
        priceNote: 'Par mois',
        badge: 'POPULAIRE',
        accent: 'blue',
        accentColor: '#3b82f6',
        accentSoft: 'rgba(59, 130, 246, 0.18)',
        accentGlow: 'rgba(59, 130, 246, 0.28)',
        icon: 'GraduationCap',
        benefits: ['Trajets domicile-établissement', 'Tarifs préférentiels', 'Suivi simple'],
    },
    {
        id: 'Universitaire',
        title: 'Abonnement Universitaire',
        description: 'Une solution pratique pour les étudiants qui souhaitent voyager facilement entre domicile, campus et résidence.',
        eligibility: 'Étudiants',
        duration: '1 mois',
        price: '20 DT',
        priceNote: 'Par mois',
        badge: 'ÉTUDIANT',
        accent: 'violet',
        accentColor: '#8b5cf6',
        accentSoft: 'rgba(139, 92, 246, 0.18)',
        accentGlow: 'rgba(139, 92, 246, 0.28)',
        icon: 'School',
        benefits: ['Accès rapide aux lignes majeures', 'Tarif étudiant', 'Gestion simplifiée'],
    },
    {
        id: 'Professionnel',
        title: 'Abonnement Professionnel',
        description: 'Une formule pensée pour les déplacements professionnels quotidiens, avec un confort de mobilité optimal.',
        eligibility: 'Professionnels',
        duration: '1 mois',
        price: '35 DT',
        priceNote: 'Par mois',
        badge: 'PRO',
        accent: 'emerald',
        accentColor: '#10b981',
        accentSoft: 'rgba(16, 185, 129, 0.18)',
        accentGlow: 'rgba(16, 185, 129, 0.28)',
        icon: 'BriefcaseBusiness',
        benefits: ['Trajets domicile-travail', 'Assistance prioritaire', 'Confort quotidien'],
    },
    {
        id: 'Mensuel',
        title: 'Abonnement Mensuel',
        description: 'Voyagez librement pendant tout le mois avec une formule souple et accessible à tous.',
        eligibility: 'Tout public',
        duration: '1 mois',
        price: '40 DT',
        priceNote: 'Par mois',
        badge: 'FLEXIBLE',
        accent: 'cyan',
        accentColor: '#06b6d4',
        accentSoft: 'rgba(6, 182, 212, 0.18)',
        accentGlow: 'rgba(6, 182, 212, 0.28)',
        icon: 'CalendarDays',
        benefits: ['Flexibilité maximale', 'Paiement simple', 'Disponibilité immédiate'],
    },
    {
        id: 'Trimestriel',
        title: 'Abonnement Trimestriel',
        description: 'Une formule économique pour vos déplacements réguliers sur plusieurs mois.',
        eligibility: 'Tout public',
        duration: '3 mois',
        price: '105 DT',
        priceNote: 'Par trimestre',
        badge: 'ÉCONOMIQUE',
        accent: 'orange',
        accentColor: '#f59e0b',
        accentSoft: 'rgba(245, 158, 11, 0.18)',
        accentGlow: 'rgba(245, 158, 11, 0.28)',
        icon: 'CalendarRange',
        benefits: ['Économie sur 3 mois', 'Mieux adapté aux habitudes', 'Régularité assurée'],
    },
    {
        id: 'Annuel',
        title: 'Abonnement Annuel',
        description: 'La formule complète pour voyager toute l’année avec des avantages de long terme.',
        eligibility: 'Tout public',
        duration: '12 mois',
        price: '380 DT',
        priceNote: 'Par an',
        badge: 'MEILLEUR PLAN',
        accent: 'indigo',
        accentColor: '#6366f1',
        accentSoft: 'rgba(99, 102, 241, 0.18)',
        accentGlow: 'rgba(99, 102, 241, 0.28)',
        icon: 'CalendarCheck',
        benefits: ['Tarif annuel optimisé', 'Réseau complet', 'Priorité d’assistance'],
    },
    {
        id: 'VIP',
        title: 'Abonnement VIP',
        description: 'Une expérience premium pensée pour les voyageurs privilégiés qui recherchent un confort d’exception.',
        eligibility: 'Membres VIP',
        duration: '12 mois',
        price: 'Premium',
        priceNote: 'Formule exclusive',
        badge: 'EXCLUSIF',
        accent: 'gold',
        accentColor: '#d4a85f',
        accentSoft: 'rgba(212, 168, 95, 0.18)',
        accentGlow: 'rgba(212, 168, 95, 0.32)',
        icon: 'Crown',
        benefits: ['Accès prioritaire', 'Service premium', 'Expérience haut de gamme'],
    },
    {
        id: 'Personnel',
        title: 'Abonnement Personnel SRTB',
        description: 'Une formule dédiée aux agents et employés de la SRTB pour faciliter les déplacements professionnels internes.',
        eligibility: 'Personnel SRTB',
        duration: 'Selon politique interne',
        price: 'Tarif personnel',
        priceNote: 'Réservé aux agents',
        badge: 'PERSONNEL SRTB',
        accent: 'royal',
        accentColor: '#1d4ed8',
        accentSoft: 'rgba(29, 78, 216, 0.18)',
        accentGlow: 'rgba(29, 78, 216, 0.28)',
        icon: 'Building2',
        benefits: ['Déplacements internes facilités', 'Accès réservé', 'Politiques internes appliquées'],
    },
];

const subscriptionIcons = {
    GraduationCap,
    School,
    BriefcaseBusiness,
    CalendarDays,
    CalendarRange,
    CalendarCheck,
    Crown,
    Building2,
};

const normalizeDuration = (value, fallback = '1 mois') => {
    if (typeof value === 'number') return `${value} mois`;

    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return fallback;

    if (normalized.includes('year') || normalized.includes('anne') || normalized.includes('12')) return '12 mois';
    if (normalized.includes('trim') || normalized.includes('3')) return '3 mois';
    if (normalized.includes('month') || normalized.includes('mens') || normalized.includes('1')) return '1 mois';
    if (normalized.includes('politique') || normalized.includes('interne')) return 'Selon politique interne';

    return fallback;
};

const formatPrice = (value, fallback = '15 DT') => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return `${value.toLocaleString('fr-FR')} DT`;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
            return fallback;
        }

        const clean = trimmed.replace(/(TND|DT|dt)/gi, '').trim();
        if (clean) {
            if (/^\d+(?:[.,]\d+)?$/.test(clean)) {
                return `${Number(clean.replace(',', '.')).toLocaleString('fr-FR')} DT`;
            }
            return trimmed;
        }
    }

    return fallback;
};

const normalizeSubscriptionType = (item, index) => {
    const fallback = subscriptionCatalogFallback.find((entry) => entry.id.toLowerCase() === String(item?.id || '').toLowerCase())
        || subscriptionCatalogFallback[index % subscriptionCatalogFallback.length];

    const raw = item && typeof item === 'object' ? item : {};
    const id = String(raw.id || fallback.id || `type-${index + 1}`);

    return {
        ...fallback,
        ...raw,
        id,
        title: raw.title || raw.label || fallback.title || `Abonnement ${id}`,
        description: raw.description || fallback.description || 'Une solution pensée pour accompagner vos déplacements.',
        eligibility: raw.eligibility || fallback.eligibility || 'Tout public',
        duration: normalizeDuration(raw.duration || raw.period || fallback.duration, fallback.duration),
        price: formatPrice(raw.price ?? raw.basePrice ?? raw.tarif ?? raw.priceLabel, fallback.price),
        priceNote: raw.priceNote || fallback.priceNote || 'À partir de',
        badge: raw.badge || fallback.badge || '',
        accent: raw.accent || fallback.accent || 'blue',
        accentColor: raw.accentColor || fallback.accentColor || '#3b82f6',
        accentSoft: raw.accentSoft || fallback.accentSoft || 'rgba(59, 130, 246, 0.18)',
        accentGlow: raw.accentGlow || fallback.accentGlow || 'rgba(59, 130, 246, 0.28)',
        icon: raw.icon || fallback.icon || 'CalendarDays',
        benefits: Array.isArray(raw.benefits) && raw.benefits.length ? raw.benefits : fallback.benefits || [],
    };
};

const normalizeSubscriptionTypes = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        return subscriptionCatalogFallback;
    }

    return items.map((item, index) => normalizeSubscriptionType(item, index));
};

const SubscriptionTypeCard = ({ item, index }) => {
    const Icon = subscriptionIcons[item.icon] || CalendarDays;
    const style = {
        '--card-accent': item.accentColor,
        '--card-accent-soft': item.accentSoft,
        '--card-accent-glow': item.accentGlow,
        animationDelay: `${index * 80}ms`,
        borderColor: item.accentColor,
    };

    return (
        <button type="button" className="subscription-type-card" style={style} onClick={() => item.onSelect?.(item)}>
            <span className="subscription-type-card-glow" aria-hidden="true" />
            <div className="subscription-type-top">
                <span className="subscription-type-icon"><Icon size={22} /></span>
                {item.badge && <span className="subscription-type-badge">{item.badge}</span>}
            </div>
            <div className="subscription-type-body">
                <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                </div>
                <div className="subscription-type-meta">
                    <div>
                        <span>Éligibilité</span>
                        <strong>{item.eligibility || 'Tout public'}</strong>
                    </div>
                    <div>
                        <span>Durée</span>
                        <strong>{item.duration || '1 mois'}</strong>
                    </div>
                </div>
            </div>
            <div className="subscription-type-footer">
                <div className="subscription-type-price">
                    <span>{item.priceNote || 'Tarif'}</span>
                    <strong>{item.price || '15 DT'}</strong>
                </div>
                <span className="subscription-type-link">
                    Voir les détails
                    <ArrowUpRight size={16} />
                </span>
            </div>
        </button>
    );
};

export const SubscriptionTypeSection = ({ types = subscriptionCatalogFallback }) => {
    const [selectedType, setSelectedType] = useState(null);
    const cards = normalizeSubscriptionTypes(types).map((item) => ({ ...item, onSelect: setSelectedType }));

    return (
        <>
            <section id="types-abonnement" className="subscription-types-section">
                <div className="subscription-types-shell">
                    <div className="subscription-types-grid">
                        {cards.map((item, index) => <SubscriptionTypeCard key={item.id || index} item={item} index={index} />)}
                    </div>
                </div>
            </section>

            <Modal
                visible={Boolean(selectedType)}
                title={selectedType?.title || 'Détail'}
                onClose={() => setSelectedType(null)}
                actions={
                    <>
                        <button type="button" className="btn-secondary" onClick={() => setSelectedType(null)}>Fermer</button>
                        <button type="button" className="btn-primary" onClick={() => setSelectedType(null)}>Choisir cette formule</button>
                    </>
                }
            >
                {selectedType && (
                    <div className="subscription-detail-panel">
                        <div className="subscription-detail-header">
                            <span className="subscription-detail-icon" style={{ background: selectedType.accentSoft, color: selectedType.color }}>
                                {(() => {
                                    const Icon = subscriptionIcons[selectedType.icon] || CalendarDays;
                                    return <Icon size={24} />;
                                })()}
                            </span>
                            <div>
                                <span className="subscription-detail-badge" style={{ background: selectedType.accentSoft, color: selectedType.color }}>{selectedType.badge}</span>
                                <h3>{selectedType.title}</h3>
                            </div>
                        </div>

                        <p className="subscription-detail-description">{selectedType.description}</p>

                        <div className="subscription-detail-grid">
                            <div>
                                <span>Eligibilité</span>
                                <strong>{selectedType.eligibility}</strong>
                            </div>
                            <div>
                                <span>Durée</span>
                                <strong>{selectedType.duration}</strong>
                            </div>
                            <div>
                                <span>Prix</span>
                                <strong>{selectedType.price}</strong>
                            </div>
                            <div>
                                <span>Catégorie</span>
                                <strong>{selectedType.badge}</strong>
                            </div>
                        </div>

                        <div className="subscription-detail-benefits">
                            <h4>Avantages inclus</h4>
                            <ul>
                                {selectedType.benefits?.map((benefit) => <li key={benefit}>{benefit}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

const Subscriptions = () => {
    const user = getCurrentUser(); const isAdmin = user?.role === 'admin';
    const [items, setItems] = useState([]); const [search, setSearch] = useState(''); const [filter, setFilter] = useState('all'); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [qrItem, setQrItem] = useState(null); const [editItem, setEditItem] = useState(null);
    useEffect(() => { getSubscriptions().then((result) => setItems(result.subscriptions || [])).catch((err) => setError(err.message || 'Impossible de charger les abonnements.')).finally(() => setLoading(false)); }, []);
    const filtered = useMemo(() => items.filter((item) => { const text = `${item.titre} ${item.type} ${item.ligne} ${item.userNom} ${item.userPrenom}`.toLowerCase(); return text.includes(search.toLowerCase()) && (filter === 'all' || normalizedStatus(item) === filter); }), [items, search, filter]);
    const current = items.find((item) => normalizedStatus(item) === 'actif');
    const stats = { total: items.length, active: items.filter((item) => normalizedStatus(item) === 'actif').length, pending: items.filter((item) => ['en_attente', 'pending'].includes(item.status)).length, expired: items.filter((item) => normalizedStatus(item) === 'expire').length };
    const remove = async (item) => { if (!window.confirm('Supprimer cet abonnement ?')) return; try { await deleteSubscription(item.id); setItems((currentItems) => currentItems.filter((entry) => entry.id !== item.id)); setMessage('Abonnement supprimé.'); } catch (err) { setError(err.message || 'Suppression impossible.'); } };
    const saveEdit = async (event) => { event.preventDefault(); try { const form = new FormData(event.currentTarget); const result = await updateSubscription(editItem.id, { nom: form.get('nom'), prenom: form.get('prenom'), ctt: form.get('ctt') }); setItems((currentItems) => currentItems.map((item) => item.id === editItem.id ? result.subscription : item)); setEditItem(null); setMessage('Abonnement mis à jour.'); } catch (err) { setError(err.message || 'Mise à jour impossible.'); } };

    if (!isAdmin) return <UserSubscriptions user={user} current={current} items={items} loading={loading} error={error} qrItem={qrItem} setQrItem={setQrItem} />;
    return <div className="page-shell"><PageHeader eyebrow="Administration" title="Abonnements" subtitle="Supervisez les abonnements actifs, expirés et en attente." />{error && <div className="error-message">{error}</div>}{message && <div className="success-message">{message}</div>}<div className="admin-stats"><StatCard icon={<Layers3 size={17} />} label="Total abonnements" value={stats.total} hint="Portefeuille global" /><StatCard icon={<CheckCircle2 size={17} />} label="Actifs" value={stats.active} hint="En circulation" tone="teal" /><StatCard icon={<Clock3 size={17} />} label="En attente" value={stats.pending} hint="À examiner" tone="amber" /><StatCard icon={<CalendarDays size={17} />} label="Expirés" value={stats.expired} hint="À renouveler" tone="slate" /></div><FilterBar search={search} onSearch={setSearch} placeholder="Rechercher un abonné ou une ligne..."><div className="filter-select-wrap"><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filtrer les abonnements"><option value="all">Tous</option><option value="actif">Actifs</option><option value="en_attente">En attente</option><option value="expire">Expirés</option></select></div></FilterBar><div className="surface admin-table-wrap">{loading ? <div className="premium-skeleton" /> : <table className="premium-table"><thead><tr><th>Abonné</th><th>Type</th><th>Ligne</th><th>Période</th><th>Prix</th><th>Statut</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><strong>{item.userPrenom} {item.userNom}</strong></td><td>{item.type}</td><td>{item.ligne}</td><td>{dateLabel(item.dateDebut)} → {dateLabel(item.dateFin)}</td><td>{Number(item.prix || 0).toLocaleString('fr-FR')} TND</td><td><StatusBadge status={normalizedStatus(item)} /></td><td><div className="table-actions"><button className="icon-button" type="button" onClick={() => setEditItem(item)} aria-label="Modifier"><Edit3 size={15} /></button><button className="icon-button" type="button" onClick={() => remove(item)} aria-label="Supprimer"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table>}</div><Modal visible={Boolean(editItem)} title="Modifier le contact" onClose={() => setEditItem(null)} actions={<><button className="btn-secondary" type="button" onClick={() => setEditItem(null)}>Annuler</button><button className="btn-primary" type="submit" form="subscription-edit">Enregistrer</button></>}><form id="subscription-edit" className="modal-form" onSubmit={saveEdit}><label className="premium-field"><span>Prénom</span><input name="prenom" defaultValue={editItem?.userPrenom || ''} required /></label><label className="premium-field"><span>Nom</span><input name="nom" defaultValue={editItem?.userNom || ''} required /></label><label className="premium-field"><span>Contact</span><input name="ctt" defaultValue={editItem?.ctt || editItem?.userEmail || ''} required /></label></form></Modal></div>;
};

const UserSubscriptions = ({ user, current, items, loading, error, qrItem, setQrItem }) => {
    const active = current ? validity(current) : null;
    const [showQr, setShowQr] = useState(false);
    const qrValue = current ? JSON.stringify({
        id: current.id,
        type: current.type,
        ligne: current.ligne,
        titre: current.titre || current.type,
        user: `${current.userPrenom || user?.prenom || ''} ${current.userNom || user?.nom || ''}`.trim(),
        dateFin: current.dateFin,
    }) : '';

    return <div className="page-shell"><PageHeader eyebrow="Espace passager" title="Mon abonnement" subtitle="Consultez votre abonnement actuel et suivez sa validité." actions={<Link className="btn-primary" to="/request-subscription"><Plus size={16} /> Demander un abonnement</Link>} />{error && <div className="error-message">{error}</div>}{loading ? <div className="subscription-loading"><div className="premium-skeleton" /></div> : current ? <><section className={`digital-pass ${showQr ? 'is-flipped' : ''}`} onClick={() => setShowQr((value) => !value)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setShowQr((value) => !value); } }} role="button" tabIndex={0} aria-label="Afficher ou masquer le code QR de l'abonnement"><div className="digital-pass-inner"><div className="digital-pass-face digital-pass-front"><div className="digital-pass-top"><div><span className="pass-brand">SRTB · PASSAGER</span><h2>{current.titre || current.type}</h2><p>{current.type} · {current.userPrenom || user?.prenom} {current.userNom || user?.nom}</p></div><StatusBadge status="actif" /></div><div className="pass-route"><div><span>Ligne</span><strong>{current.ligne}</strong><small>{current.ligne} · {current.ligneArrivee || 'Réseau SRTB'}</small></div><ArrowRight size={25} /><div><span>Validité</span><strong>{dateLabel(current.dateFin)}</strong><small>{dateLabel(current.dateDebut)} — {dateLabel(current.dateFin)}</small></div></div><div className="pass-bottom"><div><span>Tarif</span><strong>{Number(current.prix || 0).toLocaleString('fr-FR')} TND</strong></div><div><span>Validité restante</span><strong>{active.days} jours</strong></div><div className="pass-qr-hint"><QrCode size={17} /> Cliquez pour afficher le QR code</div></div><div className="pass-click-tip"><span className="pass-click-tip-icon"><QrCode size={12} /></span>Cliquez pour afficher le QR</div></div><div className="digital-pass-face digital-pass-back"><div className="qr-panel"><span className="pass-brand">SRTB · QR CODE</span><div className="qr-code-wrap"><QRCodeCanvas value={qrValue} size={160} bgColor="#ffffff" fgColor="#0f4c81" /></div><h3>{current.titre || current.type}</h3><p>{current.type} · {current.ligne}</p><small>{current.userPrenom || user?.prenom} {current.userNom || user?.nom}</small></div></div></div></section><section className="validity-card surface"><div className="validity-heading"><div><p className="eyebrow">Validité de l’abonnement</p><h2>{active.percent}% utilisé</h2></div><strong>{active.days} jours restants</strong></div><div className="validity-track"><span style={{ width: `${active.percent}%` }} /></div></section><div className="subscription-info-grid">{[['Type d’abonnement', current.type], ['Ligne', current.ligne], ['Agence', 'Agence Tunis Centre'], ['Prix', `${Number(current.prix || 0).toLocaleString('fr-FR')} TND`], ['Date de début', dateLabel(current.dateDebut)], ['Date d’expiration', dateLabel(current.dateFin)]].map(([label, value]) => <div className="info-tile surface" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="quick-actions"><Link className="btn-primary" to="/request-subscription"><Plus size={15} /> Demander un nouvel abonnement</Link><Link className="btn-secondary" to="/history"><CalendarDays size={15} /> Voir mon historique</Link></div></> : <EmptyState icon={<Layers3 size={24} />} title="Vous n’avez aucun abonnement actif" description="Commencez une demande pour bénéficier d’un abonnement de transport." action={<Link className="btn-primary" to="/request-subscription">Demander un abonnement</Link>} />}<Modal visible={Boolean(qrItem)} title="Votre pass SRTB" onClose={() => setQrItem(null)}><div className="qr-modal"><QRCodeCanvas value={JSON.stringify({ id: qrItem?.id, user: `${user?.prenom} ${user?.nom}`, line: qrItem?.ligne, validUntil: qrItem?.dateFin })} size={190} /><p>Présentez ce code lors du contrôle.</p><strong>{qrItem?.id}</strong></div></Modal></div>; };

export default Subscriptions;
