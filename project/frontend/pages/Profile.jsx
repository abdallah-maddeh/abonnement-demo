// filepath: project/frontend/pages/Profile.jsx
// Page Profile - Affichage et modification du profil

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { getDefaultAuthenticatedPath, updateProfile, getCurrentUser, isAuthenticated } from '../services/api';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const Profile = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/');
            return;
        }

        const user = getCurrentUser();
        if (user) {
            setUserId(user.id || '');
            setRole(user.role || '');
            setCreatedAt(user.dateCreation || '');
            setNom(user.nom);
            setPrenom(user.prenom);
            setEmail(user.email);
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const trimmedEmail = email.trim();

            if (!isValidEmail(trimmedEmail)) {
                throw new Error('Veuillez saisir une adresse email valide.');
            }

            if (password && password !== confirmPassword) {
                throw new Error('Les mots de passe ne correspondent pas.');
            }

            await updateProfile(prenom, nom, trimmedEmail, password);
            setSuccess('Profil mis à jour avec succès !');
            const updatedUser = { ...getCurrentUser(), prenom, nom, email: trimmedEmail };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setEmail(trimmedEmail);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{
                marginBottom: '30px'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#1E293B',
                    margin: '0 0 8px'
                }}>Profil utilisateur</h1>
                <p style={{
                    fontSize: '14px',
                    color: '#64748B',
                    margin: 0
                }}>Gardez vos informations à jour et gérez votre mot de passe en toute simplicité.</p>
            </div>

            {/* Profile Card */}
            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                border: '1px solid #F1F5F9'
            }}>
                {/* Avatar & Info */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-start',
                    marginBottom: '32px',
                    paddingBottom: '32px',
                    borderBottom: '1px solid #F1F5F9'
                }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: '#FFF7ED',
                        border: '3px solid #F97316',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#F97316',
                        flexShrink: 0
                    }}>
                        <User size={36} />
                    </div>
                    <div>
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: 700,
                            color: '#1E293B',
                            margin: '0 0 8px'
                        }}>
                            {prenom} {nom}
                        </h2>
                        <span style={{
                            display: 'inline-block',
                            background: '#FFF7ED',
                            color: '#F97316',
                            border: '1px solid #FDBA74',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 12px',
                            marginBottom: '8px'
                        }}>
                            {role?.toUpperCase()}
                        </span>
                        <p style={{
                            fontSize: '13px',
                            color: '#64748B',
                            margin: '8px 0 0'
                        }}>
                            Créé le {createdAt || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Messages */}
                    {error && (
                        <div style={{
                            background: '#FEE2E2',
                            border: '1px solid #FECACA',
                            color: '#DC2626',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '13px'
                        }}>
                            ✕ {error}
                        </div>
                    )}
                    {success && (
                        <div style={{
                            background: '#DBEAFE',
                            border: '1px solid #BFDBFE',
                            color: '#1E40AF',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '13px'
                        }}>
                            ✓ {success}
                        </div>
                    )}

                    {/* Personal Info Section */}
                    <div style={{ marginBottom: '28px' }}>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#1E293B',
                            margin: '0 0 16px'
                        }}>Informations personnelles</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label
                                    htmlFor="prenom"
                                    style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#475569',
                                        marginBottom: '6px'
                                    }}
                                >
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    id="prenom"
                                    value={prenom}
                                    onChange={(e) => setPrenom(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1.5px solid #E2E8F0',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#F97316';
                                        e.currentTarget.style.background = '#FFFBF7';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#E2E8F0';
                                        e.currentTarget.style.background = '#ffffff';
                                    }}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="nom"
                                    style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#475569',
                                        marginBottom: '6px'
                                    }}
                                >
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    id="nom"
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1.5px solid #E2E8F0',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#F97316';
                                        e.currentTarget.style.background = '#FFFBF7';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#E2E8F0';
                                        e.currentTarget.style.background = '#ffffff';
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: '#475569',
                                    marginBottom: '6px'
                                }}
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                                title="Veuillez saisir une adresse email valide, par exemple nom@example.com"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.background = '#FFFBF7';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.background = '#ffffff';
                                }}
                            />
                        </div>
                    </div>

                    {/* Password Section */}
                    <div style={{
                        marginBottom: '28px',
                        paddingBottom: '28px',
                        borderBottom: '1px solid #F1F5F9'
                    }}>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#1E293B',
                            margin: '0 0 16px'
                        }}>Mot de passe</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label
                                    htmlFor="password"
                                    style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#475569',
                                        marginBottom: '6px'
                                    }}
                                >
                                    Nouveau mot de passe
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Laisser vide pour garder l'ancien"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1.5px solid #E2E8F0',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#F97316';
                                        e.currentTarget.style.background = '#FFFBF7';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#E2E8F0';
                                        e.currentTarget.style.background = '#ffffff';
                                    }}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#475569',
                                        marginBottom: '6px'
                                    }}
                                >
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirmez le nouveau mot de passe"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1.5px solid #E2E8F0',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#F97316';
                                        e.currentTarget.style.background = '#FFFBF7';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#E2E8F0';
                                        e.currentTarget.style.background = '#ffffff';
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '12px 28px',
                                background: '#F97316',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: loading ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.background = '#EA580C';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.background = '#F97316';
                                }
                            }}
                        >
                            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(getDefaultAuthenticatedPath())}
                            style={{
                                padding: '12px 28px',
                                background: '#F1F5F9',
                                color: '#64748B',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#E2E8F0';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#F1F5F9';
                            }}
                        >
                            Retour
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
