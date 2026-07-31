import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const Welcome = () => {
    return (
        <>
            <style>{`
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
                overflow: 'hidden'
            }}>
                <div style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '60px 50px',
                    width: '100%',
                    maxWidth: '520px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                    textAlign: 'center'
                }}>
                    <img src="/assets/app.png" style={{
                        width: 100,
                        height: 100,
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto 24px auto'
                    }} alt="SRTB Logo" />

                    <h1 style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#1E293B',
                        textAlign: 'center',
                        margin: '0 0 16px 0'
                    }}>Bienvenue sur SRTB</h1>

                    <p style={{
                        fontSize: 16,
                        color: '#64748B',
                        textAlign: 'center',
                        marginTop: 0,
                        marginBottom: 48,
                        lineHeight: '1.6'
                    }}>Gestion complète de vos abonnements</p>

                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        flexDirection: 'column'
                    }}>
                        <Link to="/register" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '14px 24px',
                            borderRadius: 50,
                            border: 'none',
                            background: 'linear-gradient(135deg, #F97316, #EA580C)',
                            color: '#ffffff',
                            fontSize: 15,
                            fontWeight: 600,
                            textDecoration: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
                            transition: 'all 0.2s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.88';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            <UserPlus size={18} />
                            <span>S'inscrire</span>
                        </Link>

                        <Link to="/login" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '14px 24px',
                            borderRadius: 50,
                            border: '2px solid #F97316',
                            background: '#ffffff',
                            color: '#F97316',
                            fontSize: 15,
                            fontWeight: 600,
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#FFF5F0';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            <LogIn size={18} />
                            <span>Se connecter</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Welcome;
