import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    BusFront,
    CalendarCheck,
    CalendarDays,
    CalendarRange,
    Check,
    CheckCircle2,
    Crown,
    GraduationCap,
    MapPin,
    School,
    Search,
    Send,
    Sparkles,
    Store,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../components/PremiumUI';
import {
    createSubscriptionRequest,
    getCurrentUser,
    getSubscriptionLines,
    getSubscriptionPrice,
    getSubscriptionTypes,
} from '../services/api';

const agencies = [
    { id: 'tunis-centre', name: 'Agence Tunis Centre', location: 'Centre-ville de Tunis' },
    { id: 'bizerte', name: 'Agence Bizerte', location: 'Bizerte Centre' },
    { id: 'mateur', name: 'Agence Mateur', location: 'Mateur' },
    { id: 'sousse', name: 'Agence Sousse Est', location: 'Sousse Centre' },
    { id: 'sfax', name: 'Agence Sfax Nord', location: 'Sfax Centre' },
];

const validityOptions = [
    { id: '1', label: '1 mois', months: 1 },
    { id: '3', label: '3 mois', months: 3 },
    { id: '6', label: '6 mois', months: 6 },
    { id: '12', label: '12 mois', months: 12 },
];

const typeIcons = {
    GraduationCap,
    School,
    BriefcaseBusiness,
    CalendarDays,
    CalendarRange,
    CalendarCheck,
    Crown,
    Building2,
};

const stepLabels = ['Nom', 'Type', 'Validité', 'Ligne', 'Agence'];
const today = () => new Date().toISOString().slice(0, 10);
const addMonths = (value, months) => {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().slice(0, 10);
};
const dateLabel = (value) => (value ? new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');

const RequestSubscription = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const nameInputRef = useRef(null);
    const [started, setStarted] = useState(false);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [types, setTypes] = useState([]);
    const [lines, setLines] = useState([]);
    const [lineSearch, setLineSearch] = useState('');
    const [agencySearch, setAgencySearch] = useState('');
    const [price, setPrice] = useState(null);
    const [form, setForm] = useState({
        fullName: user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : '',
        typeId: '',
        validityId: '3',
        lineId: '',
        agencyId: agencies[0].id,
    });

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [loadedTypes, loadedLines] = await Promise.all([getSubscriptionTypes(), getSubscriptionLines()]);
                setTypes(loadedTypes || []);
                setLines(loadedLines || []);
                if (loadedLines?.length) {
                    setForm((current) => ({
                        ...current,
                        lineId: current.lineId || String(loadedLines[0].id_ligne),
                    }));
                }
            } catch (err) {
                setError(err.message || 'Impossible de charger les options disponibles.');
            } finally {
                setLoading(false);
            }
        };

        loadOptions();
    }, []);

    const selectedType = types.find((item) => item.id === form.typeId) || null;
    const selectedLine = lines.find((item) => String(item.id_ligne) === String(form.lineId)) || null;
    const selectedAgency = agencies.find((item) => item.id === form.agencyId) || agencies[0];
    const selectedValidity = validityOptions.find((item) => item.id === form.validityId) || validityOptions[1];

    useEffect(() => {
        if (!selectedType || !selectedLine) {
            setPrice(null);
            return;
        }

        let active = true;
        getSubscriptionPrice(selectedType.id, selectedLine.id_ligne)
            .then((result) => {
                if (!active) return;
                setPrice(result);
            })
            .catch(() => {
                if (!active) return;
                setPrice(null);
            });

        return () => {
            active = false;
        };
    }, [selectedType, selectedLine]);

    useEffect(() => {
        if (started && step === 0) {
            nameInputRef.current?.focus();
        }
    }, [started, step]);

    const filteredLines = useMemo(() => {
        const query = lineSearch.trim().toLowerCase();
        if (!query) return lines;
        return lines.filter((item) => `${item.label} ${item.depart} ${item.arrivee}`.toLowerCase().includes(query));
    }, [lineSearch, lines]);

    const filteredAgencies = useMemo(() => {
        const query = agencySearch.trim().toLowerCase();
        if (!query) return agencies;
        return agencies.filter((item) => `${item.name} ${item.location}`.toLowerCase().includes(query));
    }, [agencySearch]);

    const pricePreview = useMemo(() => {
        if (!selectedType || !selectedLine) return null;

        const typeStandardMonths = {
            Scolaire: 1,
            Universitaire: 1,
            Professionnel: 1,
            Mensuel: 1,
            Trimestriel: 3,
            Annuel: 12,
            VIP: 12,
            Personnel: 1,
        };

        const base = Number(selectedType.basePrice || 0);
        const defaultMonths = typeStandardMonths[selectedType.id] || 1;
        const monthsRatio = selectedValidity.months / defaultMonths;
        const coefficient = Number(price?.coefficientCategorie || 1);

        return Math.round(base * monthsRatio * coefficient);
    }, [selectedType, selectedValidity.months, price]);

    const previewStyle = {
        '--preview-accent': selectedType?.color || '#082f52',
        '--step-accent': selectedType?.color || '#1d4ed8',
        '--step-accent-soft': selectedType?.accentSoft || 'rgba(29, 78, 216, 0.17)',
    };

    if (success) {
        return (
            <div className="page-shell">
                <PageHeader
                    eyebrow="Confirmation"
                    title="Demande d’abonnement"
                    subtitle="Votre demande a bien été enregistrée."
                    actions={
                        <button className="btn-secondary" type="button" onClick={() => navigate('/subscriptions')}>
                            <ArrowLeft size={15} /> Retour
                        </button>
                    }
                />

                <div className="request-success surface">
                    <span className="success-check"><Check size={30} /></span>
                    <p className="eyebrow">Confirmation SRTB</p>
                    <h1>Demande envoyée</h1>
                    <p>Votre demande d’abonnement a bien été enregistrée et est maintenant en attente de validation.</p>
                    <div className="request-id">
                        <span>Identifiant de demande</span>
                        <strong>{success.id}</strong>
                    </div>
                    <StatusBadge status="en_attente" />
                    <div className="request-success-actions">
                        <button className="btn-primary" type="button" onClick={() => navigate('/subscriptions')}>
                            Retour à mon abonnement
                        </button>
                        <button className="btn-secondary" type="button" onClick={() => navigate('/history')}>
                            Suivre ma demande
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentStepLabel = stepLabels[step] || 'Résumé';

    const handleStart = () => {
        setStarted(true);
        setStep(0);
        setError('');
    };

    const handleNameContinue = () => {
        if (!form.fullName.trim()) {
            setError('Veuillez renseigner votre nom complet pour continuer.');
            return;
        }

        setError('');
        setStep(1);
    };

    const selectType = (typeId) => {
        setForm((current) => ({ ...current, typeId }));
        setError('');
        setStep(2);
    };

    const selectValidity = (value) => {
        setForm((current) => ({ ...current, validityId: value }));
        setError('');
        setStep(3);
    };

    const selectLine = (lineId) => {
        setForm((current) => ({ ...current, lineId }));
        setError('');
        setStep(4);
    };

    const selectAgency = (agencyId) => {
        setForm((current) => ({ ...current, agencyId }));
        setError('');
        setStep(5);
    };

    const handleSubmit = async () => {
        if (!selectedType || !selectedLine || !selectedAgency) {
            setError('Veuillez compléter toutes les informations avant d’envoyer votre demande.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const fullName = form.fullName.trim();
            const [prenom, ...rest] = fullName.split(' ');
            const nom = rest.length ? rest.join(' ') : fullName;

            const result = await createSubscriptionRequest({
                type_abonnement: selectedType.label,
                id_ligne: selectedLine.id_ligne,
                ligne_depart: selectedLine.depart,
                ligne_arrivee: selectedLine.arrivee,
                date_debut: today(),
                date_fin: addMonths(today(), selectedValidity.months),
                nom,
                prenom,
                contact: user?.email || 'demo@demo.com',
            });

            setSuccess(result.subscription || { id: `REQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}` });
        } catch (err) {
            setError(err.message || 'Impossible d’envoyer la demande pour le moment.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-shell">
            <PageHeader
                eyebrow="Nouvelle demande"
                title="Demander un abonnement"
                subtitle="Une expérience premium, guidée étape par étape pour créer votre abonnement en quelques minutes."
                actions={
                    <button className="btn-secondary request-back" type="button" onClick={() => navigate('/subscriptions')}>
                        <ArrowLeft size={15} /> Retour
                    </button>
                }
            />

            <div className="request-premium-shell" style={previewStyle}>
                <div className="request-premium-card">
                    <div className="request-premium-header">
                        <div>
                            <p className="eyebrow">Abonnement SRTB</p>
                            <h2>Créer votre demande</h2>
                        </div>
                        <button className="btn-secondary" type="button" onClick={() => navigate('/subscriptions')}>
                            <ArrowLeft size={15} /> Retour
                        </button>
                    </div>

                    <div className="request-premium-body">
                        <div className="request-live-column">
                            <div className={`request-live-card ${started ? 'is-started' : 'is-empty'}`} style={previewStyle}>
                                <div className="request-live-header">
                                    <div className="request-live-brand-row">
                                        <span className="request-live-brand">SRTB · PASSAGER</span>
                                        <StatusBadge status="actif" />
                                    </div>
                                    {started && (
                                        <div className="request-live-badge">
                                            <span className="request-live-dot" />
                                            <span>Prévisualisation en direct</span>
                                        </div>
                                    )}
                                </div>

                                <div className={`request-live-identity ${step === 1 ? 'is-focused' : ''}`}>
                                    <span className="request-live-label">Abonnement</span>
                                    <strong>{selectedType?.label || 'Type d’abonnement'}</strong>
                                </div>

                                <div className={`request-live-name ${step === 0 ? 'is-focused' : ''}`}>
                                    <span className="request-live-label">Nom complet</span>
                                    <strong>{form.fullName.trim() || 'Votre nom'}</strong>
                                </div>

                                <div className="request-live-grid">
                                    <div className={`request-live-item ${step === 3 ? 'is-focused' : ''}`}>
                                        <span className="request-live-label">Ligne</span>
                                        <strong>{selectedLine ? selectedLine.label : 'Choisir une ligne'}</strong>
                                        <small>{selectedLine ? `${selectedLine.depart} → ${selectedLine.arrivee}` : 'Aucun trajet sélectionné'}</small>
                                    </div>

                                    <div className={`request-live-item ${step === 2 ? 'is-focused' : ''}`}>
                                        <span className="request-live-label">Validité</span>
                                        <strong>{selectedValidity.label}</strong>
                                        <small>
                                            {dateLabel(today())} → {dateLabel(addMonths(today(), selectedValidity.months))}
                                        </small>
                                    </div>

                                    <div className={`request-live-item ${step === 4 ? 'is-focused' : ''}`}>
                                        <span className="request-live-label">Agence</span>
                                        <strong>{selectedAgency?.name || 'Choisir une agence'}</strong>
                                        <small>{selectedAgency?.location || 'Aucune agence sélectionnée'}</small>
                                    </div>
                                </div>

                                <div className="request-live-footer">
                                    <div className={`request-live-price ${step === 1 || step === 2 ? 'is-focused' : ''}`}>
                                        <span>Prix</span>
                                        <strong>{pricePreview ? `${pricePreview.toLocaleString('fr-FR')} DT` : '—'}</strong>
                                    </div>
                                    <div className="request-live-status">
                                        <span>Statut</span>
                                        <strong>{started ? 'En préparation' : 'Prêt'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="request-guided-panel">
                            {!started ? (
                                <div className="request-empty-state">
                                    <div className="request-empty-visual" aria-hidden="true" />
                                    <p className="eyebrow">Nouvelle demande</p>
                                    <h3>Créez votre demande d’abonnement</h3>
                                    <p>Quelques informations suffisent pour commencer.</p>
                                    <button className="btn-primary request-empty-cta" type="button" onClick={handleStart}>
                                        Commencer
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="request-progress" aria-label="Progression de la demande">
                                        {stepLabels.map((label, index) => (
                                            <div
                                                key={label}
                                                className={`request-progress-step ${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`}
                                            >
                                                <span>{index < step ? <Check size={12} /> : index + 1}</span>
                                                <small>{label}</small>
                                            </div>
                                        ))}
                                    </div>

                                    {loading ? (
                                        <div className="premium-skeleton request-skeleton" />
                                    ) : (
                                        <div className="request-form-surface">
                                            {error && <div className="error-message">{error}</div>}

                                            <div className="request-field-header">
                                                <p className="eyebrow">Étape {Math.min(step + 1, stepLabels.length)}</p>
                                                <h3>{currentStepLabel}</h3>
                                                <p>
                                                    {step === 0 && 'Renseignez votre nom complet pour personnaliser votre demande.'}
                                                    {step === 1 && 'Choisissez le type d’abonnement qui correspond le mieux à vos besoins.'}
                                                    {step === 2 && 'Sélectionnez la durée de validité souhaitée.'}
                                                    {step === 3 && 'Choisissez la ligne sur laquelle vous souhaitez profiter de l’abonnement.'}
                                                    {step === 4 && 'Sélectionnez l’agence la plus pratique pour votre demande.'}
                                                    {step === 5 && 'Vérifiez votre demande avant de l’envoyer.'}
                                                </p>
                                            </div>

                                            {step === 0 && (
                                                <div className="request-field-block">
                                                    <label className="request-field is-focused">
                                                        <span>Nom complet</span>
                                                        <input
                                                            ref={nameInputRef}
                                                            type="text"
                                                            value={form.fullName}
                                                            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                                                            onKeyDown={(event) => {
                                                                if (event.key === 'Enter') {
                                                                    event.preventDefault();
                                                                    handleNameContinue();
                                                                }
                                                            }}
                                                            placeholder="Abdallah Maddeh"
                                                        />
                                                    </label>
                                                </div>
                                            )}

                                            {step === 1 && (
                                                <div className="request-choice-grid">
                                                    {types.map((item) => {
                                                        const Icon = typeIcons[item.icon] || BusFront;
                                                        const active = form.typeId === item.id;
                                                        return (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                className={`request-choice-card ${active ? 'active' : ''}`}
                                                                onClick={() => selectType(item.id)}
                                                            >
                                                                <span className="request-choice-top">
                                                                    <span className="request-choice-icon" style={{ color: item.color }}>
                                                                        <Icon size={19} />
                                                                    </span>
                                                                    {item.badge && <span className="request-choice-badge">{item.badge}</span>}
                                                                </span>
                                                                <span className="request-choice-copy">
                                                                    <strong>{item.label}</strong>
                                                                    <small>{item.description}</small>
                                                                </span>
                                                                <span className="request-choice-meta">
                                                                    <span>{item.eligibility}</span>
                                                                    <strong>{item.basePrice ? `${Number(item.basePrice).toLocaleString('fr-FR')} DT` : item.priceLabel || 'Tarif sur devis'}</strong>
                                                                </span>
                                                                {active && <span className="request-choice-check"><Check size={14} /></span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {step === 2 && (
                                                <div className="request-field-block">
                                                    <div className="request-segmented">
                                                        {validityOptions.map((option) => (
                                                            <button
                                                                key={option.id}
                                                                type="button"
                                                                className={`request-segment ${form.validityId === option.id ? 'active' : ''}`}
                                                                onClick={() => selectValidity(option.id)}
                                                            >
                                                                <strong>{option.label}</strong>
                                                                <small>{option.months === 1 ? 'Flexible' : option.months === 3 ? 'Économique' : option.months === 6 ? 'Très pratique' : 'Meilleur tarif'}</small>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {step === 3 && (
                                                <div className="request-field-block">
                                                    <label className="request-line-search">
                                                        <Search size={15} />
                                                        <input
                                                            type="text"
                                                            value={lineSearch}
                                                            onChange={(event) => setLineSearch(event.target.value)}
                                                            placeholder="Rechercher une ligne"
                                                        />
                                                    </label>

                                                    <div className="request-choice-grid compact">
                                                        {filteredLines.map((item) => (
                                                            <button
                                                                key={item.id_ligne}
                                                                type="button"
                                                                className={`request-choice-card ${String(form.lineId) === String(item.id_ligne) ? 'active' : ''}`}
                                                                onClick={() => selectLine(item.id_ligne)}
                                                            >
                                                                <span className="request-choice-top">
                                                                    <span className="request-choice-icon forest">
                                                                        <MapPin size={18} />
                                                                    </span>
                                                                    <span className="request-choice-badge muted">{item.label}</span>
                                                                </span>
                                                                <span className="request-choice-copy">
                                                                    <strong>{item.depart} → {item.arrivee}</strong>
                                                                    <small>Trajet régulier entre {item.depart} et {item.arrivee}</small>
                                                                </span>
                                                                <span className="request-choice-meta">
                                                                    <span>Ligne</span>
                                                                    <strong>{item.label}</strong>
                                                                </span>
                                                                {String(form.lineId) === String(item.id_ligne) && <span className="request-choice-check"><Check size={14} /></span>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {step === 4 && (
                                                <div className="request-field-block">
                                                    <label className="request-line-search">
                                                        <Search size={15} />
                                                        <input
                                                            type="text"
                                                            value={agencySearch}
                                                            onChange={(event) => setAgencySearch(event.target.value)}
                                                            placeholder="Rechercher une agence"
                                                        />
                                                    </label>

                                                    <div className="request-choice-grid compact">
                                                        {filteredAgencies.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                className={`request-choice-card ${form.agencyId === item.id ? 'active' : ''}`}
                                                                onClick={() => selectAgency(item.id)}
                                                            >
                                                                <span className="request-choice-top">
                                                                    <span className="request-choice-icon accent">
                                                                        <Store size={18} />
                                                                    </span>
                                                                    <span className="request-choice-badge muted">Agence</span>
                                                                </span>
                                                                <span className="request-choice-copy">
                                                                    <strong>{item.name}</strong>
                                                                    <small>{item.location}</small>
                                                                </span>
                                                                <span className="request-choice-meta">
                                                                    <span>Disponibilité</span>
                                                                    <strong>Ouvert</strong>
                                                                </span>
                                                                {form.agencyId === item.id && <span className="request-choice-check"><Check size={14} /></span>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {step === 5 && (
                                                <div className="request-review-panel">
                                                    <div className="request-review-card">
                                                        <div className="request-review-row">
                                                            <span>Nom complet</span>
                                                            <strong>{form.fullName}</strong>
                                                        </div>
                                                        <div className="request-review-row">
                                                            <span>Type</span>
                                                            <strong>{selectedType?.label}</strong>
                                                        </div>
                                                        <div className="request-review-row">
                                                            <span>Validité</span>
                                                            <strong>{selectedValidity.label}</strong>
                                                        </div>
                                                        <div className="request-review-row">
                                                            <span>Ligne</span>
                                                            <strong>{selectedLine ? `${selectedLine.label} · ${selectedLine.depart} → ${selectedLine.arrivee}` : '-'}</strong>
                                                        </div>
                                                        <div className="request-review-row">
                                                            <span>Agence</span>
                                                            <strong>{selectedAgency?.name}</strong>
                                                        </div>
                                                        <div className="request-review-row total">
                                                            <span>Prix estimé</span>
                                                            <strong>{pricePreview ? `${pricePreview.toLocaleString('fr-FR')} DT` : '—'}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="request-actions">
                                                {step > 0 && step < 5 && (
                                                    <button
                                                        className="btn-secondary"
                                                        type="button"
                                                        onClick={() => setStep((current) => Math.max(current - 1, 0))}
                                                    >
                                                        <ArrowLeft size={15} /> Précédent
                                                    </button>
                                                )}

                                                {step < 5 ? (
                                                    <button
                                                        className="btn-primary"
                                                        type="button"
                                                        disabled={
                                                            (step === 0 && !form.fullName.trim()) ||
                                                            (step === 1 && !selectedType) ||
                                                            (step === 2 && !selectedValidity) ||
                                                            (step === 3 && !selectedLine) ||
                                                            (step === 4 && !selectedAgency)
                                                        }
                                                        onClick={() => {
                                                            if (step === 0) {
                                                                handleNameContinue();
                                                                return;
                                                            }
                                                            setStep((current) => current + 1);
                                                        }}
                                                    >
                                                        Continuer <ArrowRight size={15} />
                                                    </button>
                                                ) : (
                                                    <button className="btn-primary" type="button" onClick={handleSubmit} disabled={submitting}>
                                                        <Send size={15} /> {submitting ? 'Envoi...' : 'Envoyer la demande'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestSubscription;
