import { ArrowLeft, BusFront, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthShell = ({
    eyebrow,
    title,
    subtitle,
    children,
    footer,
    asideTitle = 'Une mobilité plus simple, chaque jour.',
    asideDescription = 'Accédez à vos abonnements, suivez vos demandes et consultez votre historique depuis un espace personnel sécurisé.'
}) => (
    <main className="auth-shell">
        <aside className="auth-visual">
            <div className="auth-visual-top">
                <Link className="auth-brand" to="/">
                    <img src="/assets/application.png" alt="SRTB" />
                    <span>
                        <strong>SRTB</strong>
                        <small>Abonnement SRTB</small>
                    </span>
                </Link>
            </div>

            <div className="auth-visual-copy">
                <p className="eyebrow">Service numérique SRTB</p>
                <h2>{asideTitle}</h2>
                <p>{asideDescription}</p>

                <div className="auth-trust-list">
                    <span><ShieldCheck size={16} /> Données protégées</span>
                    <span><BusFront size={16} /> Réseau de transport</span>
                    <span><CheckCircle2 size={16} /> Suivi en temps réel</span>
                </div>
            </div>

            <div className="auth-route route-a" />
            <div className="auth-route route-b" />
            <div className="auth-visual-footer">SRTB · Mobilité publique en Tunisie</div>
        </aside>

        <section className="auth-content">
            <Link className="auth-back" to="/">
                <ArrowLeft size={15} />
                Accueil
            </Link>

            <div className="auth-form-wrap">
                <div className="auth-heading">
                    <p className="eyebrow">{eyebrow}</p>
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>

                {children}
                {footer}
            </div>
        </section>
    </main>
);

export default AuthShell;
