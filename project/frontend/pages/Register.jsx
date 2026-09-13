import { useMemo, useState } from 'react';
import { Check, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { getDefaultAuthenticatedPath, register } from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [touched, setTouched] = useState({ firstName: false, lastName: false, email: false, password: false, confirmPassword: false });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [success, setSuccess] = useState(false);

    const passwordChecks = useMemo(() => [
        { label: '8 caractères minimum', valid: form.password.length >= 8 },
        { label: 'Une majuscule', valid: /[A-Z]/.test(form.password) },
        { label: 'Un chiffre', valid: /\d/.test(form.password) },
        { label: 'Un caractère spécial', valid: /[^A-Za-z0-9]/.test(form.password) },
    ], [form.password]);

    const passwordScore = passwordChecks.filter((criterion) => criterion.valid).length;
    const strengthLabel = passwordScore <= 1 ? 'Faible' : passwordScore <= 3 ? 'Moyen' : 'Fort';

    const validateField = (field, value) => {
        switch (field) {
            case 'firstName':
                return value.trim() ? '' : 'Le prénom est requis.';
            case 'lastName':
                return value.trim() ? '' : 'Le nom est requis.';
            case 'email':
                if (!value.trim()) return 'L’email est requis.';
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Saisissez une adresse email valide.';
            case 'password':
                if (!value.trim()) return 'Le mot de passe est requis.';
                if (value.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
                return '';
            case 'confirmPassword':
                if (!value.trim()) return 'La confirmation du mot de passe est requise.';
                if (value !== form.password) return 'Les mots de passe ne correspondent pas.';
                return '';
            default:
                return '';
        }
    };

    const errors = {
        firstName: validateField('firstName', form.firstName),
        lastName: validateField('lastName', form.lastName),
        email: validateField('email', form.email),
        password: validateField('password', form.password),
        confirmPassword: validateField('confirmPassword', form.confirmPassword),
    };

    const isValid = !errors.firstName && !errors.lastName && !errors.email && !errors.password && !errors.confirmPassword && acceptedTerms;

    const submit = async (event) => {
        event.preventDefault();
        setError('');

        const nextTouched = {
            firstName: true,
            lastName: true,
            email: true,
            password: true,
            confirmPassword: true,
        };

        setTouched(nextTouched);

        if (!isValid) {
            return;
        }

        setLoading(true);

        try {
            await register(form.firstName.trim(), form.lastName.trim(), form.email.trim(), form.password);
            setSuccess(true);
            window.setTimeout(() => {
                navigate(getDefaultAuthenticatedPath(), { replace: true });
            }, 1400);
        } catch (err) {
            setError(err.message || 'Impossible de créer le compte pour le moment.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthShell
                eyebrow="Compte créé"
                title="Votre espace SRTB est prêt"
                subtitle="Votre compte a été créé avec succès. Vous allez être redirigé vers votre espace personnel."
                asideTitle="Une mobilité plus fluide, avec vous."
                asideDescription="Créez votre espace personnel, gérez vos abonnements et suivez vos demandes depuis une plateforme sécurisée et moderne."
            >
                <div className="auth-success-panel" role="status">
                    <div className="auth-success-icon">
                        <CheckCircle2 size={28} />
                    </div>
                    <h2>Compte créé avec succès</h2>
                    <p>Votre espace SRTB est prêt.</p>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            eyebrow="Créer votre accès"
            title="Créer votre compte"
            subtitle="Rejoignez la plateforme Abonnement SRTB et accédez rapidement à votre espace personnel."
            asideTitle="Une mobilité plus fluide, avec vous."
            asideDescription="Créez votre compte pour gérer vos abonnements, consulter votre historique et suivre vos demandes plus simplement."
        >
            <form className="auth-form-premium" onSubmit={submit} noValidate>
                {error && <div className="auth-alert auth-alert-error" role="alert">{error}</div>}

                <div className="auth-name-grid">
                    <Field
                        id="register-first-name"
                        label="Prénom"
                        icon={<UserRound size={16} />}
                        value={form.firstName}
                        onChange={(value) => setForm((current) => ({ ...current, firstName: value }))}
                        onBlur={() => setTouched((current) => ({ ...current, firstName: true }))}
                        placeholder="Ahmed"
                        autoComplete="given-name"
                        error={touched.firstName ? errors.firstName : ''}
                    />
                    <Field
                        id="register-last-name"
                        label="Nom"
                        icon={<UserRound size={16} />}
                        value={form.lastName}
                        onChange={(value) => setForm((current) => ({ ...current, lastName: value }))}
                        onBlur={() => setTouched((current) => ({ ...current, lastName: true }))}
                        placeholder="Ben Salah"
                        autoComplete="family-name"
                        error={touched.lastName ? errors.lastName : ''}
                    />
                </div>

                <Field
                    id="register-email"
                    label="Adresse email"
                    icon={<Mail size={16} />}
                    type="email"
                    value={form.email}
                    onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                    onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                    error={touched.email ? errors.email : ''}
                />

                <Field
                    id="register-password"
                    label="Mot de passe"
                    icon={<LockKeyhole size={16} />}
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(value) => setForm((current) => ({ ...current, password: value, confirmPassword: current.confirmPassword }))}
                    onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                    placeholder="Créez un mot de passe"
                    autoComplete="new-password"
                    error={touched.password ? errors.password : ''}
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

                <div className="auth-password-strength">
                    <div className="password-meter-header">
                        <span>Qualité du mot de passe</span>
                        <strong className={`strength-${strengthLabel.toLowerCase()}`}>{strengthLabel}</strong>
                    </div>

                    <div className="password-meter-bars">
                        {[1, 2, 3, 4].map((bar) => (
                            <span key={bar} className={bar <= passwordScore ? 'is-filled' : ''} />
                        ))}
                    </div>

                    <ul className="auth-password-list">
                        {passwordChecks.map((criterion) => (
                            <li key={criterion.label} className={criterion.valid ? 'is-ok' : ''}>
                                <span className="criteria-dot" aria-hidden="true" />
                                {criterion.label}
                            </li>
                        ))}
                    </ul>
                </div>

                <Field
                    id="register-confirm-password"
                    label="Confirmer le mot de passe"
                    icon={<LockKeyhole size={16} />}
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))}
                    onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                    placeholder="Répétez votre mot de passe"
                    autoComplete="new-password"
                    error={touched.confirmPassword ? errors.confirmPassword : ''}
                    action={
                        <button
                            className="field-action"
                            type="button"
                            onClick={() => setShowConfirm((value) => !value)}
                            aria-label={showConfirm ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                        >
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    }
                />

                <label className="auth-consent">
                    <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(event) => setAcceptedTerms(event.target.checked)}
                    />
                    <span>J’accepte les conditions d’utilisation du service SRTB.</span>
                </label>

                <button className="auth-submit" type="submit" disabled={loading || !isValid}>
                    {loading ? <><span className="auth-spinner" />Création...</> : 'Créer mon compte'}
                </button>

                <p className="auth-switch">
                    Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </form>
        </AuthShell>
    );
};

const Field = ({ id, label, icon, type = 'text', value, onChange, onBlur, placeholder, action, autoComplete = 'off', error }) => (
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

export default Register;
