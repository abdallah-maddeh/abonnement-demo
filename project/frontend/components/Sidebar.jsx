import { NavLink } from 'react-router-dom';
import { Home, Users, CreditCard, TicketPercent, FileCheck, Clock, UserRound } from 'lucide-react';
import { getCurrentUser } from '../services/api';

const Sidebar = ({ collapsed = false, open = false }) => {
    const user = getCurrentUser();

    const links = user?.role === 'admin'
        ? [
              { to: '/dashboard', icon: <Home size={18} />, label: 'Tableau de bord' },
              { to: '/users', icon: <Users size={18} />, label: 'Utilisateurs' },
              { to: '/subscriptions', icon: <CreditCard size={18} />, label: 'Abonnements' },
              { to: '/subscription-types', icon: <TicketPercent size={18} />, label: 'Types d’abonnement' },
              { to: '/subscription-requests', icon: <FileCheck size={18} />, label: 'Demandes d\'abonnement' },
          ]
        : [
              { to: '/subscriptions', icon: <CreditCard size={18} />, label: 'Mon abonnement' },
              { to: '/subscription-types', icon: <TicketPercent size={18} />, label: 'Types d’abonnement' },
              { to: '/request-subscription', icon: <FileCheck size={18} />, label: 'Demander un abonnement' },
              { to: '/history', icon: <Clock size={18} />, label: 'Historique' },
          ];

    return (
        <aside className={`sidebar${collapsed ? ' is-collapsed' : ''}${open ? ' is-open' : ''}`}>
            <div className="brand">
                <img className="brand-mark" src="/assets/application.png" alt="SRTB" />
                <div className="brand-copy"><h2 className="brand-name">SRTB</h2><p className="brand-caption">Abonnements transport</p></div>
            </div>
            <nav className="sidebar-nav">
                <div className="nav-section-label">Espace de travail</div>
                {links.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className="nav-link"
                        aria-label={item.label}
                        data-label={item.label}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
                <NavLink to="/profile" className="nav-link" aria-label="Profil" data-label="Profil">
                    <UserRound size={18} />
                    <span>Profil</span>
                </NavLink>
            </nav>
            {user && <div className="sidebar-footer"><div className="sidebar-user"><span className="avatar">{`${user.prenom || ''}${user.nom || ''}`.slice(0, 2).toUpperCase()}</span><div className="sidebar-user-copy"><div className="sidebar-user-name">{user.prenom} {user.nom}</div><div className="sidebar-user-role">{user.role?.toUpperCase()}</div></div></div></div>}
        </aside>
    );
};

export default Sidebar;
