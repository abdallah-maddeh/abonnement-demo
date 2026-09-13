import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, RefreshCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { getDefaultAuthenticatedPath, login, resetDemoData } from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [role, setRole] = useState('user');
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState({ email: false, password: false });

    const validateEmail = (value) => {
        if (!value.trim()) return 'Saisissez votre adresse email.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Cette adresse email n’est pas valide.';
        return '';
    };

    const validatePassword = (value) => {
        if (!value.trim()) return 'Saisissez votre mot de passe.';
        if (value.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
        return '';
    };

    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const isFormValid = !emailError && !passwordError && form.email.trim() && form.password.trim();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextTouched = { email: true, password: true };
        setTouched(nextTouched);
        setError('');
        setSuccess('');

        if (emailError || passwordError) {
            return;
        }

        setLoading(true);

        try {
            await login(form.email.trim(), form.password, role);
            navigate(getDefaultAuthenticatedPath(), { replace: true });
        } catch (err) {
            setError(err.message || 'Impossible de se connecter pour le moment.');
        } finally {
            setLoading(false);
        }
    };

    const resetDemo = async () => {
        setError('');
        try {
            const result = await resetDemoData();
            setSuccess(result.message);
            setForm({ email: '', password: '' });
            setRole('user');
            setTouched({ email: false, password: false });
        } catch {
            setError('Impossible de réinitialiser les données de démonstration.');
        }
    };

    return (
        <AuthShell
            eyebrow="Espace sécurisé"
            title="Bienvenue sur SRTB"
            subtitle="Connectez-vous à votre espace personnel pour gérer vos abonnements, vos demandes et votre historique."
            asideTitle="Gérez vos abonnements de transport simplement."
            asideDescription="Accédez à vos abonnements, suivez vos demandes et consultez votre historique depuis un espace personnel sécurisé."
        >
            <form className="auth-form-premium" onSubmit={handleSubmit} noValidate>
                {error && <div className="auth-alert auth-alert-error" role="alert">{error}</div>}
                {success && <div className="auth-alert auth-alert-success" role="status">{success}</div>}

                <Field
                    id="login-email"
                    label="Adresse email"
                    icon={<Mail size={16} />}
                    type="email"
                    value={form.email}
                    onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                    onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                    error={touched.email ? emailError : ''}
                />

                <Field
                    id="login-password"
                    label="Mot de passe"
                    icon={<LockKeyhole size={16} />}
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(value) => setForm((current) => ({ ...current, password: value }))}
                    onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
                    error={touched.password ? passwordError : ''}
                    action={
                        <button
                            className="field-action"
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    }
                />

                <div className="auth-options">
                    <label className="auth-checkbox">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(event) => setRemember(event.target.checked)}
                        />
                        <span>Se souvenir de moi</span>
                    </label>

                    <Link to="/forgot-password">Mot de passe oublié ?</Link>
                </div>

                <label className="auth-select-label">
                    <span>Accès</span>
                    <select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Type d'accès">
                        <option value="user">Espace utilisateur</option>
                        <option value="admin">Espace administrateur</option>
                    </select>
                </label>

                <button className="auth-submit" type="submit" disabled={loading || !isFormValid}>
                    {loading ? <><span className="auth-spinner" />Connexion...</> : 'Se connecter'}
                </button>

                <p className="auth-switch">
                    Vous n’avez pas encore de compte ? <Link to="/register">Créer un compte</Link>
                </p>

                <div className="demo-access">
                    <div>
                        <strong>Mode démonstration</strong>
                        <span>Données fictives isolées de l’API réelle.</span>
                    </div>
                    <button type="button" onClick={resetDemo} aria-label="Réinitialiser les données de démonstration">
                        <RefreshCcw size={15} />
                    </button>
                </div>
            </form>
        </AuthShell>
    );
};

const Field = ({ id, label, icon, type = 'text', value, onChange, onBlur, placeholder, action, autoComplete, error }) => (
    <label className={`auth-field ${error ? 'has-error' : ''}`} htmlFor={id}>
        <span>{label}</span>
        <div className="auth-input-wrap">
            {icon}
            <input
                id={id}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onBlur={onBlur}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={Boolean(error)}
            />
            {action}
        </div>
        {error && <small className="field-error">{error}</small>}
    </label>
);

export default Login;
