import { ArrowRight, BusFront, LockKeyhole, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Welcome = () => (
    <main className="welcome-page">
        <section className="welcome-panel">
            <div className="welcome-brand"><img src="/assets/application.png" alt="SRTB" /><div><strong>SRTB</strong><span>Service numérique des abonnements</span></div></div>
            <div className="welcome-content">
                <p className="eyebrow">Mobilité publique · Tunisie</p>
                <h1>Votre trajet commence ici.</h1>
                <p className="welcome-lead">Gérez vos abonnements de transport avec un espace simple, sécurisé et toujours disponible.</p>
                <div className="welcome-actions"><Link className="welcome-primary" to="/login">Accéder à mon espace <ArrowRight size={17} /></Link><Link className="welcome-secondary" to="/register"><UserPlus size={17} /> Créer un compte</Link></div>
                <div className="welcome-trust"><span><LockKeyhole size={15} /> Données protégées</span><span><BusFront size={15} /> Réseau SRTB</span></div>
            </div>
            <footer className="welcome-footer">Abonnement SRTB <span>•</span> Une mobilité plus fluide, chaque jour.</footer>
        </section>
        <aside className="welcome-visual"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="visual-copy"><span className="visual-label">SRTB / 01</span><strong>En mouvement,<br />avec vous.</strong><small>Une plateforme pensée pour vos trajets quotidiens.</small></div></aside>
    </main>
);

export default Welcome;
