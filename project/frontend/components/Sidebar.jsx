import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Layers, Clock, User, LogOut } from 'lucide-react';
import { logout, getCurrentUser } from '../services/api';

const Sidebar = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const links = user?.role === 'admin'
        ? [
              { to: '/dashboard', icon: <Home size={18} />, label: 'Tableau de bord' },
              { to: '/users', icon: <Users size={18} />, label: 'Utilisateurs' },
              { to: '/subscriptions', icon: <Layers size={18} />, label: 'Abonnements' },
              { to: '/subscription-requests', icon: <Clock size={18} />, label: 'Demandes d\'abonnement' },
          ]
        : [
              { to: '/subscriptions', icon: <Layers size={18} />, label: 'Mon abonnement' },
              { to: '/request-subscription', icon: <Clock size={18} />, label: 'Demander un abonnement' },
              { to: '/history', icon: <Clock size={18} />, label: 'Historique' },
          ];

    return (
        <aside style={{
            width: '260px',
            background: '#1C1917',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(0,0,0,0.1)',
            overflowY: 'auto'
        }}>
            {/* Logo Section */}
            <div style={{
                padding: '24px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                }}>
                    <img
                        src="/assets/application.png"
                        style={{
                            width: 44,
                            height: 44,
                            objectFit: 'contain',
                            borderRadius: 8,
                            flexShrink: 0
                        }}
                        alt="SRTB"
                    />
                    <div>
                        <h2 style={{
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: 16,
                            margin: 0,
                            marginBottom: 2
                        }}>SRTB</h2>
                        <p style={{
                            color: '#A8A29E',
                            fontSize: 12,
                            margin: 0
                        }}>Gestion abonnements</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{
                flex: 1,
                padding: '16px 8px'
            }}>
                {links.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        style={({ isActive }) => ({
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            marginBottom: '4px',
                            color: isActive ? '#ffffff' : '#A8A29E',
                            background: isActive ? '#F97316' : 'transparent',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        })}
                        onMouseEnter={(e) => {
                            if (e.currentTarget.style.background !== '#F97316') {
                                e.currentTarget.style.background = 'rgba(249, 115, 22, 0.15)';
                                e.currentTarget.style.color = '#F97316';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (e.currentTarget.style.background !== '#F97316') {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#A8A29E';
                            }
                        }}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
                <NavLink
                    to="/profile"
                    style={({ isActive }) => ({
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        marginBottom: '4px',
                        color: isActive ? '#ffffff' : '#A8A29E',
                        background: isActive ? '#F97316' : 'transparent',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    })}
                    onMouseEnter={(e) => {
                        if (e.currentTarget.style.background !== '#F97316') {
                            e.currentTarget.style.background = 'rgba(249, 115, 22, 0.15)';
                            e.currentTarget.style.color = '#F97316';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (e.currentTarget.style.background !== '#F97316') {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#A8A29E';
                        }
                    }}
                >
                    <User size={18} />
                    <span>Profil</span>
                </NavLink>
            </nav>

            {/* Footer - User Info & Logout */}
            {user && (
                <div style={{
                    padding: '16px 8px',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '12px'
                    }}>
                        <p style={{
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: 14,
                            margin: '0 0 6px'
                        }}>
                            {user.prenom} {user.nom}
                        </p>
                        <span style={{
                            display: 'inline-block',
                            background: '#F97316',
                            color: '#ffffff',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 8px'
                        }}>
                            {user.role?.toUpperCase()}
                        </span>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
