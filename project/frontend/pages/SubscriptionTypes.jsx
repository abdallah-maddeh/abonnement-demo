import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PremiumUI';
import { getSubscriptionTypes } from '../services/api';
import { SubscriptionTypeSection, subscriptionCatalogFallback } from './Subscriptions';

const SubscriptionTypes = () => {
    const [types, setTypes] = useState(subscriptionCatalogFallback);

    useEffect(() => {
        let isMounted = true;

        getSubscriptionTypes()
            .then((result) => {
                if (isMounted && Array.isArray(result) && result.length > 0) {
                    setTypes(result);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setTypes(subscriptionCatalogFallback);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="page-shell">
            <PageHeader
                eyebrow="SRTB"
                title="Types d’abonnement"
                subtitle="Explorez les formules disponibles et choisissez celle qui correspond le mieux à vos besoins de mobilité."
                actions={
                    <Link className="btn-primary" to="/request-subscription">
                        Demander un abonnement
                    </Link>
                }
            />
            <SubscriptionTypeSection types={types} />
        </div>
    );
};

export default SubscriptionTypes;
