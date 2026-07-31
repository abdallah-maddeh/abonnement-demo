import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { getDefaultAuthenticatedPath, register } from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
            setError('Veuillez renseigner tous les champs.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setLoading(true);

        try {
            await register(firstName, lastName, email, password);
            navigate(getDefaultAuthenticatedPath(), { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              * { box-sizing: border-box; }
            `}</style>

            <div style={{
                height: '100vh',
                width: '100vw',
                backgroundImage: "url('/assets/back.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                padding: '24px',
                overflow: 'auto'
            }}>
                <div style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '44px 40px',
                    width: '100%',
                    maxWidth: '420px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                    margin: 'auto'
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
                        fontSize: 14,
                        color: '#64748B',
                        textAlign: 'center',
                        marginTop: 6,
                        marginBottom: 32
                    }}>Créez votre compte</p>

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

                        <div style={{ marginBottom: 14 }}>
                            <label htmlFor="firstName" style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: 6,
                                display: 'block'
                            }}>Prénom</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: 13,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF'
                                }}>
                                    <User size={16} />
                                </div>
                                <input
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Prénom"
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

                        <div style={{ marginBottom: 14 }}>
                            <label htmlFor="lastName" style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: 6,
                                display: 'block'
                            }}>Nom</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: 13,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF'
                                }}>
                                    <User size={16} />
                                </div>
                                <input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Nom"
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

                        <div style={{ marginBottom: 14 }}>
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

                        <div style={{ marginBottom: 14, marginTop: 16 }}>
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

                        <div style={{ marginBottom: 28, marginTop: 14 }}>
                            <label htmlFor="confirmPassword" style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: 6,
                                display: 'block'
                            }}>Confirmer mot de passe</label>
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
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirmer mot de passe"
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
                                    onClick={() => setShowConfirmPassword((s) => !s)}
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
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.opacity = '0.88';
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
                                background: loading ? '#FBD0A8' : 'linear-gradient(135deg, #F97316, #EA580C)',
                                color: '#ffffff',
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <svg style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="4" />
                                        <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                    </svg>
                                    <span>Inscription...</span>
                                </div>
                            ) : (
                                'S\'inscrire'
                            )}
                        </button>

                        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
                            Vous avez un compte ? <Link to="/login" style={{ color: '#F97316', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Register;
