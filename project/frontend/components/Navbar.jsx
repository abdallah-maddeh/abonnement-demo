// filepath: project/frontend/components/Navbar.jsx
// Composant Navbar - Barre de navigation

import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { logout, getCurrentUser } from '../services/api';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();

    // Gérer la déconnexion
    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <nav style={{
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            paddingRight: '40px',
            borderBottom: '1px solid #F1F5F9'
        }}>
            <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '32px'
            }}>
                {/* Left - Title */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    minWidth: 0
                }}>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1917' }}>
                            Bonjour, {user?.prenom || user?.name} 
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                            {new Date().toLocaleDateString('fr-FR', { 
                                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>

                {/* Right - Search, Bell, User, Logout */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    {/* Search */}
                    <div style={{
                        position: 'relative',
                        width: '240px'
                    }}>
                        <Search size={18} style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9CA3AF'
                        }} />
                        <input
                            type="search"
                            placeholder="Rechercher..."
                            aria-label="Rechercher"
                            style={{
                                width: '100%',
                                paddingLeft: '40px',
                                paddingRight: '14px',
                                paddingTop: '8px',
                                paddingBottom: '8px',
                                background: '#F1F5F9',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.border = '1.5px solid #F97316';
                                e.currentTarget.style.background = '#ffffff';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.border = 'none';
                                e.currentTarget.style.background = '#F1F5F9';
                            }}
                        />
                    </div>

                    <NotificationDropdown />

                    {/* User Info & Logout */}
                    {user && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            paddingLeft: '16px',
                            borderLeft: '1px solid #E2E8F0'
                        }}>
                            <div>
                                <p style={{
                                    fontWeight: 600,
                                    color: '#1E293B',
                                    fontSize: 14,
                                    margin: '0 0 4px'
                                }}>
                                    {user.prenom} {user.nom}
                                </p>
                                <span style={{
                                    display: 'inline-block',
                                    background: '#FFF7ED',
                                    color: '#F97316',
                                    border: '1px solid #FDBA74',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: '3px 10px'
                                }}>
                                    {user.role?.toUpperCase()}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: '#F97316',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '9px 18px',
                                    fontWeight: 600,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#EA580C'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#F97316'}
                            >
                                Déconnexion
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
