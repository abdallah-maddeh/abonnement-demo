import { useEffect, useState } from 'react';
import { getDashboardData } from '../services/api';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const dashboard = await getDashboardData();
                setData(dashboard);
            } catch (err) {
                setError(err.message || 'Impossible de charger les données de démonstration.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Tableau de bord de démonstration</h1>
                <p>
                    Cette interface présente un aperçu fictif des indicateurs clés des abonnements,
                    des agences et des lignes.
                </p>
            </div>

            {loading && <p>Chargement des données de démonstration...</p>}
            {error && <p style={{ color: '#dc2626' }}>{error}</p>}

            {data && (
                <>
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h2>{data.totalSubscriptions}</h2>
                            <p>Abonnements totaux</p>
                        </div>
                        <div className="dashboard-card">
                            <h2>{data.activeSubscriptions}</h2>
                            <p>Abonnements actifs</p>
                        </div>
                        <div className="dashboard-card">
                            <h2>{data.pendingSubscriptions}</h2>
                            <p>Demandes en attente</p>
                        </div>
                        <div className="dashboard-card">
                            <h2>{data.monthlyRevenue.toLocaleString('fr-FR')} TND</h2>
                            <p>Chiffre d'affaires mensuel</p>
                        </div>
                    </div>

                    <section className="dashboard-section">
                        <h3>Agences de démonstration</h3>
                        <div className="dashboard-grid-2">
                            {data.agencies.map((agency) => (
                                <div className="dashboard-card" key={agency.id}>
                                    <strong>{agency.nom}</strong>
                                    <p>{agency.region}</p>
                                    <p>{agency.responsable}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="dashboard-section">
                        <h3>Lignes de démonstration</h3>
                        <div className="dashboard-grid-2">
                            {data.lines.map((line) => (
                                <div className="dashboard-card" key={line.id_ligne}>
                                    <strong>{line.label}</strong>
                                    <p>{line.depart} → {line.arrivee}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="dashboard-section">
                        <h3>Statistiques rapides</h3>
                        <div className="dashboard-grid-2">
                            {data.reports.map((report) => (
                                <div className="dashboard-card" key={report.id}>
                                    <strong>{report.titre}</strong>
                                    <p>{report.valeur}</p>
                                    <small>{report.description}</small>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default Dashboard;
