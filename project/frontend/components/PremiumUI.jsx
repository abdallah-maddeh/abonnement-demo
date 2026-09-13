import { AlertCircle, Check, Clock3, Search, UserRound } from 'lucide-react';

export const PageHeader = ({ eyebrow, title, subtitle, actions }) => (
    <div className="premium-page-header">
        <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
        {actions && <div className="page-header-actions">{actions}</div>}
    </div>
);

export const Avatar = ({ name = '', size = 'md' }) => <span className={`premium-avatar avatar-${size}`}>{name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || <UserRound size={16} />}</span>;

const statusMap = {
    actif: { label: 'Actif', icon: Check, tone: 'success' },
    validee: { label: 'Validée', icon: Check, tone: 'success' },
    approved: { label: 'Approuvée', icon: Check, tone: 'success' },
    en_attente: { label: 'En attente', icon: Clock3, tone: 'warning' },
    pending: { label: 'En attente', icon: Clock3, tone: 'warning' },
    expire: { label: 'Expiré', icon: AlertCircle, tone: 'neutral' },
    expiré: { label: 'Expiré', icon: AlertCircle, tone: 'neutral' },
    refusee: { label: 'Refusée', icon: AlertCircle, tone: 'danger' },
    rejected: { label: 'Refusée', icon: AlertCircle, tone: 'danger' },
};

export const StatusBadge = ({ status }) => {
    const normalized = String(status || '').toLowerCase();
    const config = statusMap[normalized] || { label: status || 'Inconnu', icon: Clock3, tone: 'neutral' };
    const Icon = config.icon;
    return <span className={`premium-status status-${config.tone}`}><Icon size={13} />{config.label}</span>;
};

export const StatCard = ({ label, value, hint, icon, tone = 'blue' }) => <article className={`premium-stat stat-tone-${tone}`}><span className="premium-stat-icon">{icon}</span><p>{label}</p><strong>{value}</strong><small>{hint}</small></article>;

export const FilterBar = ({ search, onSearch, placeholder = 'Rechercher...', children }) => (
    <div className="premium-filterbar"><label className="premium-search"><Search size={16} /><input value={search} onChange={(event) => onSearch?.(event.target.value)} placeholder={placeholder} aria-label={placeholder} /></label>{children}</div>
);

export const EmptyState = ({ icon, title, description, action }) => <div className="premium-empty"><span className="premium-empty-icon">{icon}</span><h2>{title}</h2><p>{description}</p>{action}</div>;

export const Skeleton = ({ className = '' }) => <div className={`premium-skeleton ${className}`} aria-hidden="true" />;

export const DetailRow = ({ label, children }) => <div className="detail-row"><span>{label}</span><strong>{children}</strong></div>;
