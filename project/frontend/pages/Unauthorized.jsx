import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { getDefaultAuthenticatedPath } from '../services/api';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="unauthorized-page">
            <div className="unauthorized-card">
                <div className="unauthorized-icon">
                    <ShieldAlert size={34} />
                </div>
                <h1>Accès non autorisé</h1>
                <p>Accès non autorisé. Cette page est réservée à l'administrateur.</p>
                <button type="button" onClick={() => navigate(getDefaultAuthenticatedPath())}>
                    Retour à l'accueil
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
