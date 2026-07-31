import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { getDefaultAuthenticatedPath, login, resetDemoData } from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Veuillez renseigner votre email et votre mot de passe.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await login(email, password, role);
            navigate(getDefaultAuthenticatedPath(), { replace: true });
        } catch (err) {
            setError(err.message || 'Erreur de démonstration.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetDemoData = async () => {
        setError('');
        setSuccess('');
        try {
            const response = await resetDemoData();
            setSuccess(response.message);
            setEmail('');
            setPassword('');
            setRole('user');
        } catch (err) {
            setError('Impossible de réinitialiser les données de démonstration.');
        }
    };

    return (
        <>
            <style>{`
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              * { box-sizing: border-box; }
            `}</style>

            <div style={{
                position: 'relative',
                minHeight: '100vh',
                width: '100vw',
                backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.25), rgba(15, 23, 42, 0.25)), url('/assets/back.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                padding: '24px',
                overflow: 'hidden'
            }}>
                <div style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    padding: '40px 36px',
                    width: '100%',
                    maxWidth: '460px',
                    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)',
                    marginTop: '0',
                    marginBottom: '0'
                }}>
                    <img src="/assets/app.png" style={{
                        width: 90,
                        height: 90,
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto 16px auto'
                    }} alt="SRTB Logo" />

                    <h1 style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: '#1E293B',
                        textAlign: 'center',
                        margin: 0
                    }}>SRTB</h1>

                    <p style={{
                        fontSize: 15,
                        color: '#475569',
                        textAlign: 'center',
                        marginTop: 10,
                        marginBottom: 24,
                        lineHeight: 1.7
                    }}>Connectez-vous à votre espace</p>

                    <div style={{
                        marginBottom: 28,
                        padding: '22px 20px',
                        borderRadius: 18,
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0'
                    }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#111827' }}>Mode Démo</h2>
                        <p style={{ fontSize: 13, color: '#475569', margin: '10px 0 0', lineHeight: 1.6 }}>
                            Cette application est une démonstration. Toutes les données sont fictives.
                            Aucun backend ni base de données n'est utilisé.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                color: '#B91C1C',
                                fontSize: 13,
                                borderRadius: 10,
                                padding: '11px 14px',
                                marginBottom: 20
                            }}>{error}</div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label htmlFor="email" style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: 6,
                                display: 'block'
                            }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: 13,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF'
                                }}>
                                    <Mail size={16} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    required
                                    onFocus={(e) => {
                                        e.currentTarget.style.border = '1.5px solid #F97316';
                                        e.currentTarget.style.background = '#FFFBF7';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.border = '1.5px solid #E5E7EB';
                                        e.currentTarget.style.background = '#ffffff';
                                    }}
                                    style={{
                                        width: '100%',
                                        border: '1.5px solid #E5E7EB',
                                        borderRadius: 12,
                                        padding: '13px 14px 13px 40px',
                                        fontSize: 14,
                                        outline: 'none',
                                        color: '#1E293B',
                                        background: '#ffffff',
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 22, marginTop: 16 }}>
                            <label htmlFor="role" style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: 6,
                                display: 'block'
                            }}>Rôle de démonstration</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{
                                    width: '100%',
                                    border: '1.5px solid #E5E7EB',
                                    borderRadius: 12,
                                    padding: '13px 14px',
                                    fontSize: 14,
                                    outline: 'none',
                                    color: '#1E293B',
                                    background: '#ffffff',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <option value="user">Utilisateur</option>
                                <option value="admin">Administrateur</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 28, marginTop: 16 }}>
                            <label htmlFor="password" style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: 6,
                                display: 'block'
                            }}>Mot de passe</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: 13,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF'
                                }}>
                                    <Lock size={16} />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mot de passe"
                                    required
                                    onFocus={(e) => {
                                        e.currentTarget.style.border = '1.5px solid #F97316';
                                        e.currentTarget.style.background = '#FFFBF7';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.border = '1.5px solid #E5E7EB';
                                        e.currentTarget.style.background = '#ffffff';
                                    }}
                                    style={{
                                        width: '100%',
                                        border: '1.5px solid #E5E7EB',
                                        borderRadius: 12,
                                        padding: '13px 44px 13px 40px',
                                        fontSize: 14,
                                        outline: 'none',
                                        color: '#1E293B',
                                        background: '#ffffff',
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    aria-label="Toggle password visibility"
                                    style={{
                                        position: 'absolute',
                                        right: 13,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#9CA3AF',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <Link to="/forgot-password" style={{
                            fontSize: 13,
                            color: '#F97316',
                            fontWeight: 500,
                            textDecoration: 'none',
                            display: 'block',
                            textAlign: 'right',
                            marginTop: 10,
                            marginBottom: 28
                        }}>Mot de passe oublié ?</Link>

                        <button
                            type="submit"
                            disabled={loading}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.opacity = '0.92';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'none';
                            }}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: 50,
                                border: 'none',
                                background: loading ? '#FBD0A8' : 'linear-gradient(135deg, #F97316, #F59E0B)',
                                color: '#ffffff',
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 6px 18px rgba(249,115,22,0.24)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <svg style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="4" />
                                        <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                    </svg>
                                    <span>Connexion...</span>
                                </div>
                            ) : (
                                'Se connecter'
                            )}
                        </button>

                        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
                            Pas encore de compte ? <Link to="/register" style={{ color: '#F97316', fontWeight: 600, textDecoration: 'none' }}>S'inscrire</Link>
                        </div>

                        <div style={{ marginTop: 24, padding: '18px', borderRadius: 16, background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Comptes de démonstration</p>
                            <div style={{ marginTop: 12, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                                <p style={{ margin: '0 0 8px', lineHeight: 1.5 }}><strong>Compte Administrateur (Démo)</strong><br />Rôle : Administrateur</p>
                                <p style={{ margin: '0 0 8px', lineHeight: 1.5 }}><strong>Compte Utilisateur (Démo)</strong><br />Rôle : Utilisateur</p>
                                <p style={{ margin: 0, lineHeight: 1.5 }}>N'importe quel email et mot de passe sont acceptés.</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleResetDemoData}
                            style={{
                                width: '100%',
                                marginTop: 18,
                                padding: '14px',
                                borderRadius: 50,
                                border: '1px solid #CBD5E1',
                                background: '#ffffff',
                                color: '#1F2937',
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffffff';
                            }}
                        >
                            Réinitialiser les données de démonstration
                        </button>

                        {success && (
                            <div style={{
                                marginTop: 16,
                                padding: '12px 14px',
                                background: '#ecfdf5',
                                borderRadius: 12,
                                border: '1px solid #d1fae5',
                                color: '#166534',
                                fontSize: 13
                            }}>
                                {success}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;
