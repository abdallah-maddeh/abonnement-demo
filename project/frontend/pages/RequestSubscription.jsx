import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createSubscriptionRequest,
    getCurrentUser,
    getSubscriptionLines,
    getSubscriptionPrice,
    getSubscriptionTypes,
} from '../services/api';
import { ArrowLeft, Plus } from 'lucide-react';

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: '#ffffff',
};

const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
};

const focusOrange = (e) => {
    e.currentTarget.style.borderColor = '#F97316';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
};

const blurInput = (e) => {
    e.currentTarget.style.borderColor = '#E2E8F0';
    e.currentTarget.style.boxShadow = 'none';
};

const toDateInputValue = (date) => date.toISOString().slice(0, 10);

const addMonths = (dateValue, months) => {
    if (!dateValue) return '';
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '';
    date.setMonth(date.getMonth() + months);
    return toDateInputValue(date);
};

const calculateEndDate = (dateDebut, duration) => {
    if (!dateDebut || !duration) return '';
    if (duration === 'year') return addMonths(dateDebut, 12);
    if (duration === 'month') return addMonths(dateDebut, 1);
    return addMonths(dateDebut, 6);
};

const RequestSubscription = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [loading, setLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [priceLoading, setPriceLoading] = useState(false);
    const [priceDetails, setPriceDetails] = useState(null);
    const [priceError, setPriceError] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [types, setTypes] = useState([]);
    const [lines, setLines] = useState([]);
    const [formData, setFormData] = useState({
        typeId: '',
        idLigne: '',
        dateDebut: '',
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        contact: user?.email || '',
    });

    useEffect(() => {
        const loadOptions = async () => {
            setOptionsLoading(true);
            setError('');
            try {
                const [loadedTypes, loadedLines] = await Promise.all([
                    getSubscriptionTypes(),
                    getSubscriptionLines(),
                ]);
                setTypes(loadedTypes || []);
                setLines(loadedLines || []);
                setFormData((current) => ({
                    ...current,
                    typeId: current.typeId || loadedTypes?.[0]?.id || '',
                    idLigne: current.idLigne || String(loadedLines?.[0]?.id_ligne || ''),
                }));
            } catch (err) {
                setError(err.message || 'Erreur lors du chargement des lignes.');
            } finally {
                setOptionsLoading(false);
            }
        };

        loadOptions();
    }, []);

    const selectedType = useMemo(() => {
        return types.find((type) => type.id === formData.typeId);
    }, [types, formData.typeId]);

    const selectedLine = useMemo(() => {
        return lines.find((line) => String(line.id_ligne) === String(formData.idLigne));
    }, [lines, formData.idLigne]);

    useEffect(() => {
        if (!formData.typeId || !formData.idLigne) {
            setPriceDetails(null);
            return undefined;
        }

        let cancelled = false;
        const loadPrice = async () => {
            setPriceLoading(true);
            setPriceError('');
            try {
                const calculation = await getSubscriptionPrice(formData.typeId, formData.idLigne);
                if (!cancelled) setPriceDetails(calculation);
            } catch (err) {
                if (!cancelled) {
                    setPriceDetails(null);
                    setPriceError(err.message || 'Impossible de calculer le prix.');
                }
            } finally {
                if (!cancelled) setPriceLoading(false);
            }
        };

        loadPrice();
        return () => { cancelled = true; };
    }, [formData.typeId, formData.idLigne]);

    const dateFin = useMemo(() => {
        return calculateEndDate(formData.dateDebut, selectedType?.duration);
    }, [formData.dateDebut, selectedType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const prix = Number(priceDetails?.prix);
        if (!selectedType || !selectedLine || !formData.dateDebut || !dateFin || !Number.isFinite(prix) || prix <= 0 || !formData.nom || !formData.prenom || !formData.contact) {
            setError('Veuillez remplir tous les champs obligatoires.');
            setLoading(false);
            return;
        }

        try {
            await createSubscriptionRequest({
                type_abonnement: selectedType.label,
                id_ligne: selectedLine.id_ligne,
                ligne_depart: 'Bizerte',
                ligne_arrivee: selectedLine.label,
                date_debut: formData.dateDebut,
                date_fin: dateFin,
                nom: formData.nom,
                prenom: formData.prenom,
                contact: formData.contact,
            });
            setSuccess('Votre demande d’abonnement a été envoyée avec succès. L’administrateur l’examinera bientôt.');
            setTimeout(() => navigate('/subscriptions'), 2000);
        } catch (err) {
            setError(err.message || 'Erreur lors de l’envoi de la demande.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
                <button
                    onClick={() => navigate('/subscriptions')}
                    style={{ background: 'transparent', border: 'none', color: '#F97316', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                        Demander un abonnement
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: '8px 0 0' }}>
                        Choisissez un type, une ligne et une date de début. Les dates et le prix sont calculés automatiquement.
                    </p>
                </div>
            </div>

            {error && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
                    {error}
                </div>
            )}
            {success && (
                <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
                    {success}
                </div>
            )}

            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9', maxWidth: '860px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={labelStyle}>Type d’abonnement <span style={{ color: '#DC2626' }}>*</span></label>
                        <select
                            value={formData.typeId}
                            onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                            required
                            disabled={optionsLoading}
                            style={inputStyle}
                            onFocus={focusOrange}
                            onBlur={blurInput}
                        >
                            {types.map((type) => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Ligne d'arrivée <span style={{ color: '#DC2626' }}>*</span></label>
                        <select
                            value={formData.idLigne}
                            onChange={(e) => setFormData({ ...formData, idLigne: e.target.value })}
                            required
                            disabled={optionsLoading || lines.length === 0}
                            style={inputStyle}
                            onFocus={focusOrange}
                            onBlur={blurInput}
                        >
                            {lines.map((line) => (
                                <option key={line.id_ligne} value={line.id_ligne}>{line.label}</option>
                            ))}
                        </select>
                        {!optionsLoading && lines.length === 0 && (
                            <p style={{ margin: '8px 0 0', color: '#DC2626', fontSize: '12px' }}>Aucune ligne disponible.</p>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Date début <span style={{ color: '#DC2626' }}>*</span></label>
                            <input
                                type="date"
                                value={formData.dateDebut}
                                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                                required
                                style={inputStyle}
                                onFocus={focusOrange}
                                onBlur={blurInput}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Date fin</label>
                            <input
                                type="date"
                                value={dateFin}
                                readOnly
                                disabled
                                style={{ ...inputStyle, background: '#F8FAFC', color: '#64748B', cursor: 'not-allowed' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Prix calculé (TND)</label>
                        <input
                            type="text"
                            value={priceLoading ? 'Calcul en cours...' : (priceDetails ? `${Number(priceDetails.prix).toFixed(2)} TND` : '')}
                            placeholder="Sélectionnez un type et une ligne"
                            readOnly
                            disabled
                            style={{ ...inputStyle, background: '#F8FAFC', color: '#0F172A', fontWeight: 700, cursor: 'not-allowed' }}
                        />
                        {priceDetails && (
                            <p style={{ margin: '7px 0 0', color: '#64748B', fontSize: '12px' }}>
                                {Number(priceDetails.tarifMensuel).toFixed(2)} TND/mois × {priceDetails.dureeMois} mois
                                {' '}× {Math.round(Number(priceDetails.remiseDuree) * 100)}% durée
                                {' '}× {Math.round(Number(priceDetails.coefficientCategorie) * 100)}% catégorie
                            </p>
                        )}
                        {priceError && <p style={{ margin: '7px 0 0', color: '#DC2626', fontSize: '12px' }}>{priceError}</p>}
                    </div>

                    <div style={{ height: '1px', background: '#E2E8F0', margin: '8px 0' }} />

                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>
                        Vos informations
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <TextInput label="Nom" value={formData.nom} onChange={(value) => setFormData({ ...formData, nom: value })} />
                        <TextInput label="Prénom" value={formData.prenom} onChange={(value) => setFormData({ ...formData, prenom: value })} />
                    </div>

                    <TextInput
                        label="Contact téléphone ou email"
                        value={formData.contact}
                        onChange={(value) => setFormData({ ...formData, contact: value })}
                        placeholder="+216 XX XXX XXX ou email@example.com"
                    />

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/subscriptions')}
                            style={{ padding: '11px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading || optionsLoading || priceLoading || !priceDetails || lines.length === 0}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '11px 24px',
                                background: loading || optionsLoading || priceLoading || !priceDetails || lines.length === 0 ? '#FDBF8A' : 'linear-gradient(135deg, #F97316, #EA580C)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: loading || optionsLoading || priceLoading || !priceDetails || lines.length === 0 ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                            }}
                        >
                            <Plus size={16} /> {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TextInput = ({ label, value, onChange, placeholder = '' }) => (
    <div>
        <label style={labelStyle}>{label} <span style={{ color: '#DC2626' }}>*</span></label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required
            style={inputStyle}
            onFocus={focusOrange}
            onBlur={blurInput}
        />
    </div>
);

export default RequestSubscription;
