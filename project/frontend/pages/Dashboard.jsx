import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, CalendarClock, CheckCircle2, CircleDollarSign, Map, UsersRound } from 'lucide-react';
import { getCurrentUser, getDashboardData } from '../services/api';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const user = getCurrentUser();

    useEffect(() => {
        let active = true;
        getDashboardData()
            .then((result) => { if (active) setData(result); })
            .catch((err) => { if (active) setError(err.message || 'Impossible de charger le tableau de bord.'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const statusSummary = useMemo(() => {
        if (!data) return [];
        const total = Math.max(Number(data.totalSubscriptions) || 1, 1);
        return [
            { label: 'Actifs', value: data.activeSubscriptions || 0, color: 'var(--color-accent)', percent: Math.round(((data.activeSubscriptions || 0) / total) * 100) },
            { label: 'En attente', value: data.pendingSubscriptions || 0, color: '#c28a2c', percent: Math.round(((data.pendingSubscriptions || 0) / total) * 100) },
            { label: 'Autres', value: Math.max(total - (data.activeSubscriptions || 0) - (data.pendingSubscriptions || 0), 0), color: '#9cb0bf', percent: 0 },
        ];
    }, [data]);

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div><p className="eyebrow">Vue d'ensemble</p><h1>Bonjour, {user?.prenom || 'administrateur'}</h1><p>Suivez l'activité des abonnements et les demandes à traiter.</p></div>
                <div className="dashboard-date"><CalendarClock size={16} /> Mise à jour en temps réel</div>
            </div>
            {error && <div className="error-message">{error}</div>}
            {loading && <div className="dashboard-grid dashboard-skeletons">{[1, 2, 3, 4].map((item) => <div className="dashboard-card skeleton" key={item} />)}</div>}
            {data && <>
                <div className="dashboard-grid kpi-grid">
                    <StatCard icon={<Activity size={18} />} label="Abonnements totaux" value={data.totalSubscriptions} meta="Portefeuille actuel" tone="blue" />
                    <StatCard icon={<CheckCircle2 size={18} />} label="Abonnements actifs" value={data.activeSubscriptions} meta="En circulation" tone="teal" />
                    <StatCard icon={<CalendarClock size={18} />} label="Demandes en attente" value={data.pendingSubscriptions} meta="À examiner" tone="amber" />
                    <StatCard icon={<CircleDollarSign size={18} />} label="Revenus mensuels" value={`${Number(data.monthlyRevenue || 0).toLocaleString('fr-FR')} TND`} meta="Estimation courante" tone="slate" />
                </div>
                <div className="dashboard-feature-grid">
                    <section className="surface dashboard-panel dashboard-activity"><div className="panel-heading"><div><p className="eyebrow">Activité</p><h2>Flux des abonnements</h2></div><span className="panel-link">30 derniers jours <ArrowUpRight size={15} /></span></div><div className="activity-chart" aria-label="Graphique d'activité des abonnements">{[38, 52, 44, 68, 58, 76, 63, 84, 72, 92, 78, 96].map((height, index) => <div className="chart-column" key={index}><span style={{ height: `${height}%` }} /><small>{index + 1}</small></div>)}</div></section>
                    <section className="surface dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">Répartition</p><h2>État du portefeuille</h2></div></div><div className="status-summary">{statusSummary.map((status) => <div className="status-row" key={status.label}><span className="status-dot" style={{ background: status.color }} /><span>{status.label}</span><strong>{status.value}</strong><small>{status.percent}%</small></div>)}</div><div className="status-bar">{statusSummary.map((status) => <span key={status.label} style={{ width: `${Math.max(status.percent, status.value ? 5 : 0)}%`, background: status.color }} />)}</div></section>
                </div>
                <div className="dashboard-feature-grid lower-grid">
                    <section className="surface dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">Mobilité</p><h2>Lignes les plus utilisées</h2></div><Map size={18} color="var(--color-accent)" /></div><div className="route-list">{(data.lines || []).map((line, index) => <div className="route-row" key={line.id_ligne}><span className="route-rank">0{index + 1}</span><div><strong>{line.label}</strong><small>{line.depart} → {line.arrivee}</small></div><div className="route-meter"><span style={{ width: `${Math.max(90 - index * 15, 25)}%` }} /></div></div>)}</div></section>
                    <section className="surface dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">Réseau SRTB</p><h2>Agences actives</h2></div><UsersRound size={18} color="var(--color-accent)" /></div><div className="agency-list">{(data.agencies || []).map((agency) => <div className="agency-row" key={agency.id}><span className="avatar">{agency.nom.slice(0, 1)}</span><div><strong>{agency.nom}</strong><small>{agency.region} · {agency.responsable}</small></div><ArrowUpRight size={15} /></div>)}</div></section>
                </div>
            </>}
        </div>
    );
};

const StatCard = ({ icon, label, value, meta, tone }) => <article className={`dashboard-card stat-card stat-${tone}`}><div className="stat-icon">{icon}</div><p>{label}</p><strong>{value}</strong><small>{meta}</small></article>;

export default Dashboard;
