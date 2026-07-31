import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Key } from 'lucide-react';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [token, setToken] = useState(searchParams.get('token') || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setEmail(searchParams.get('email') || '');
        setToken(searchParams.get('token') || '');
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email.trim() || !token.trim()) {
            setError('Lien de reinitialisation invalide ou incomplet.');
            return;
        }

        if (!password.trim() || !confirmPassword.trim()) {
            setError('Veuillez completer tous les champs.');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);

        try {
            const data = await resetPassword(email, token, password);
            setSuccess(data.message || 'Votre mot de passe a bien ete reinitialise.');
            setPassword('');
            setConfirmPassword('');
            window.setTimeout(() => navigate('/login'), 1800);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <Key size={32} />
                    </div>
                    <div>
                        <h1>Reinitialiser le mot de passe</h1>
                        <p>Definissez un nouveau mot de passe pour votre compte.</p>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            readOnly
                            className="input-disabled"
                            placeholder="Adresse email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Nouveau mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nouveau mot de passe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmer le mot de passe"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading || success}>
                        {loading ? 'Validation...' : 'Reinitialiser'}
                    </button>
                </form>

                <div className="auth-actions">
                    <Link to="/" className="link-secondary">
                        Retour a la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
