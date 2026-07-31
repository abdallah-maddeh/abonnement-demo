import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield } from 'lucide-react';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [sentEmail, setSentEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setSentEmail('');

        if (!email.trim()) {
            setError('Veuillez indiquer votre adresse email.');
            return;
        }

        setLoading(true);

        try {
            await forgotPassword(email);
            setSentEmail(email.trim());
            setMessage('success');
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
                minHeight: '100vh',
                width: '100vw',
                background: '#F5F5F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                padding: '24px'
            }}>
                <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '48px 40px',
                    width: '100%',
                    maxWidth: '480px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        marginBottom: '32px'
                    }}>
                        <div style={{
                            background: '#FFF0E6',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Shield size={32} color="#F97316" />
                        </div>
                        <div>
                            <h1 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#1F2937',
                                margin: 0,
                                marginBottom: '6px'
                            }}>Mot de passe oublié</h1>
                            <p style={{
                                fontSize: '14px',
                                color: '#6B7280',
                                margin: 0
                            }}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            background: '#FEE2E2',
                            border: '1px solid #FECACA',
                            color: '#DC2626',
                            fontSize: '13px',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '20px'
                        }}>{error}</div>
                    )}

                    {message && sentEmail && (
                        <div style={{
                            background: '#071413',
                            color: '#ffffff',
                            borderRadius: '8px',
                            padding: '24px',
                            marginBottom: '24px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                        }}>
                            <h2 style={{
                                fontSize: '28px',
                                lineHeight: 1.1,
                                fontWeight: 800,
                                margin: '0 0 18px'
                            }}>Mot de passe oublié</h2>
                            <p style={{
                                fontSize: '16px',
                                lineHeight: 1.6,
                                fontWeight: 700,
                                margin: 0
                            }}>
                                Un email de réinitialisation a été envoyé à<br />
                                <span style={{ wordBreak: 'break-word' }}>{sentEmail}</span>
                            </p>
                            <p style={{
                                fontSize: '16px',
                                lineHeight: 1.6,
                                fontWeight: 700,
                                margin: '6px 0 0'
                            }}>
                                Veuillez vérifier votre boîte de réception et suivre les instructions.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{
                            position: 'relative',
                            marginBottom: '28px'
                        }}>
                            <div style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9CA3AF'
                            }}>
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email de connexion"
                                required
                                style={{
                                    width: '100%',
                                    border: '1.5px solid #E5E7EB',
                                    borderRadius: '8px',
                                    padding: '12px 14px 12px 44px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    color: '#1F2937',
                                    background: '#ffffff',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.border = '1.5px solid #F97316';
                                    e.currentTarget.style.background = '#FFFBF7';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.border = '1.5px solid #E5E7EB';
                                    e.currentTarget.style.background = '#ffffff';
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: loading ? '#FDBF8A' : '#F97316',
                                color: '#ffffff',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                marginBottom: '16px'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.opacity = '0.88';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                            }}
                        >
                            {loading ? 'Envoi...' : 'Envoyer le lien'}
                        </button>
                    </form>

                    <div style={{
                        textAlign: 'center'
                    }}>
                        <Link to="/" style={{
                            fontSize: '14px',
                            color: '#000000',
                            fontWeight: '500',
                            textDecoration: 'none',
                            transition: 'color 0.2s ease'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#333333'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#000000'}
                        >
                            Retour a la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
