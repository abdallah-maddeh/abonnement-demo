import { useEffect, useState } from 'react';
import { CalendarDays, KeyRound, Mail, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getDefaultAuthenticatedPath, isAuthenticated, updateProfile } from '../services/api';
import { Avatar, DetailRow, PageHeader, StatusBadge } from '../components/PremiumUI';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ prenom: '', nom: '', email: '', password: '', confirmPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) { navigate('/'); return; }
        const current = getCurrentUser();
        setUser(current);
        setForm({ prenom: current?.prenom || '', nom: current?.nom || '', email: current?.email || '', password: '', confirmPassword: '' });
    }, [navigate]);

    const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
    const save = async (event) => {
        event.preventDefault(); setMessage({ type: '', text: '' });
        if (!isValidEmail(form.email)) { setMessage({ type: 'error', text: 'Veuillez saisir une adresse email valide.' }); return; }
        if (form.password && form.password !== form.confirmPassword) { setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' }); return; }
        setLoading(true);
        try { await updateProfile(form.prenom, form.nom, form.email.trim(), form.password); setUser({ ...getCurrentUser(), prenom: form.prenom, nom: form.nom, email: form.email.trim() }); setMessage({ type: 'success', text: 'Vos informations ont été mises à jour.' }); } catch (error) { setMessage({ type: 'error', text: error.message || 'Impossible de mettre à jour le profil.' }); } finally { setLoading(false); }
    };

    if (!user) return null;
    return <div className="page-shell">
        <PageHeader eyebrow="Compte" title="Mon profil" subtitle="Gérez vos informations personnelles et les paramètres de votre compte." />
        {message.text && <div className={`${message.type}-message`}>{message.text}</div>}
        <div className="profile-premium-grid">
            <section className="surface profile-identity-card"><div className="profile-identity-top"><Avatar name={`${user.prenom} ${user.nom}`} size="lg" /><div><h2>{user.prenom} {user.nom}</h2><p>{user.email}</p><StatusBadge status={user.actif === false ? 'refusee' : 'actif'} /></div></div><div className="profile-identity-meta"><DetailRow label="Rôle">{user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</DetailRow><DetailRow label="Membre depuis">{user.dateCreation || 'Janvier 2026'}</DetailRow><DetailRow label="Compte">{user.actif === false ? 'Désactivé' : 'Actif'}</DetailRow></div></section>
            <form className="surface profile-form-card" onSubmit={save}>
                <div className="section-heading"><div className="section-icon"><UserRound size={17} /></div><div><h2>Informations personnelles</h2><p>Ces informations sont utilisées pour vos demandes.</p></div></div>
                <div className="profile-form-grid"><Field label="Prénom" value={form.prenom} onChange={updateField('prenom')} /><Field label="Nom" value={form.nom} onChange={updateField('nom')} /><Field label="Email" value={form.email} onChange={updateField('email')} type="email" wide /></div>
                <div className="profile-divider" />
                <div className="section-heading"><div className="section-icon"><KeyRound size={17} /></div><div><h2>Sécurité du compte</h2><p>Laissez les champs vides pour conserver votre mot de passe actuel.</p></div></div>
                <div className="profile-form-grid"><Field label="Nouveau mot de passe" value={form.password} onChange={updateField('password')} type="password" /><Field label="Confirmer le mot de passe" value={form.confirmPassword} onChange={updateField('confirmPassword')} type="password" /></div>
                <div className="profile-actions"><button className="btn-secondary" type="button" onClick={() => navigate(getDefaultAuthenticatedPath())}>Retour</button><button className="btn-primary" type="submit" disabled={loading}><Save size={15} /> {loading ? 'Enregistrement...' : 'Enregistrer'}</button></div>
            </form>
            <section className="surface profile-account-card"><div className="section-heading"><div className="section-icon"><ShieldCheck size={17} /></div><div><h2>Informations du compte</h2><p>État actuel de votre accès SRTB.</p></div></div><DetailRow label="Identifiant">{user.id}</DetailRow><DetailRow label="Rôle">{user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</DetailRow><DetailRow label="Statut"><span className="account-active"><span /> Actif</span></DetailRow><DetailRow label="Dernière mise à jour"><CalendarDays size={14} /> Aujourd'hui</DetailRow></section>
        </div>
    </div>;
};

const Field = ({ label, value, onChange, type = 'text', wide = false }) => <label className={`premium-field${wide ? ' field-wide' : ''}`}><span>{label}</span><div className="field-control">{label === 'Email' && <Mail size={15} />}<input type={type} value={value} onChange={onChange} required={type !== 'password'} /></div></label>;

export default Profile;
