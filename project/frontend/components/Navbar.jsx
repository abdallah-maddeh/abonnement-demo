// filepath: project/frontend/components/Navbar.jsx
// Composant Navbar - Barre de navigation

import { useNavigate } from 'react-router-dom';
import { Menu, PanelLeft, Search } from 'lucide-react';
import { logout, getCurrentUser } from '../services/api';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onMenu, onCollapse }) => {
    const navigate = useNavigate();
    const user = getCurrentUser();

    // Gérer la déconnexion
    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const initials = `${user?.prenom || ''}${user?.nom || ''}`.slice(0, 2).toUpperCase() || 'ST';
    return (
        <header className="topbar">
            <div className="topbar-left">
                <button className="collapse-button desktop-toggle" type="button" onClick={onCollapse} aria-label="Réduire la navigation"><PanelLeft size={18} /></button>
                <button className="collapse-button mobile-toggle" type="button" onClick={onMenu} aria-label="Ouvrir la navigation"><Menu size={20} /></button>
                <div><div className="topbar-greeting">Bonjour, {user?.prenom || 'utilisateur'}</div><div className="topbar-date">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
            </div>
            <div className="topbar-actions">
                <label className="topbar-search"><Search size={16} aria-hidden="true" /><input type="search" placeholder="Rechercher" aria-label="Rechercher" /></label>
                <NotificationDropdown />
                {user && <div className="topbar-profile"><span className="avatar" aria-hidden="true">{initials}</span><div className="topbar-profile-copy"><strong>{user.prenom} {user.nom}</strong><span className="role-label">{user.role?.toUpperCase()}</span></div><button className="logout-button" type="button" onClick={handleLogout}>Déconnexion</button></div>}
            </div>
        </header>
    );
};

export default Navbar;
