import { useEffect, useMemo, useState } from 'react';
import {
    createSubscription,
    deleteSubscription,
    getSubscription,
    getSubscriptionRequests,
    refuseSubscription,
    updateSubscription,
    validateSubscription,
} from '../services/api';
import Modal from '../components/Modal';
import { CheckCircle, Edit2, Eye, Plus, Trash2, XCircle } from 'lucide-react';

const emptyForm = {
    type: 'Mensuel',
    ligne: '',
    ligneArrivee: '',
    prix: 0,
    dateDebut: '',
    dateFin: '',
    status: 'en_attente',
    nom: '',
    prenom: '',
    ctt: '',
};

const statusLabels = {
    en_attente: 'En attente',
    validee: 'Validée',
    refusee: 'Refusée',
    actif: 'Actif',
    expiré: 'Expiré',
    pending: 'En attente',
    approved: 'Validée',
    rejected: 'Refusée',
};

const statusColors = {
    en_attente: { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D' },
    validee: { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' },
    refusee: { bg: '#FEE2E2', text: '#7F1D1D', border: '#FECACA' },
    actif: { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' },
    expiré: { bg: '#FEE2E2', text: '#7F1D1D', border: '#FECACA' },
    pending: { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D' },
    approved: { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' },
    rejected: { bg: '#FEE2E2', text: '#7F1D1D', border: '#FECACA' },
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
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

const toInputDate = (value) => {
    if (!value) return '';
    return String(value).slice(0, 10);
};

const SubscriptionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [formData, setFormData] = useState(emptyForm);

    const loadRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getSubscriptionRequests();
            setRequests(data.requests || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const stats = useMemo(() => ({
        total: requests.length,
        pending: requests.filter((item) => item.status === 'en_attente' || item.status === 'pending').length,
        validated: requests.filter((item) => item.status === 'validee' || item.status === 'approved' || item.status === 'actif').length,
        refused: requests.filter((item) => item.status === 'refusee' || item.status === 'rejected').length,
    }), [requests]);

    const showSuccess = (message) => {
        setSuccess(message);
        window.setTimeout(() => setSuccess(''), 3000);
    };

    const openCreateModal = () => {
        setFormMode('create');
        setFormData(emptyForm);
        setError('');
        setFormVisible(true);
    };

    const openEditModal = (request) => {
        setFormMode('edit');
        setSelectedRequest(request);
        setFormData({
            type: request.type || 'Mensuel',
            ligne: request.ligne || '',
            ligneArrivee: request.ligneArrivee || '',
            prix: Number(request.prix || 0),
            dateDebut: toInputDate(request.dateDebut),
            dateFin: toInputDate(request.dateFin),
            status: request.status || 'en_attente',
            nom: request.nom || request.userNom || '',
            prenom: request.prenom || request.userPrenom || '',
            ctt: request.ctt || request.userEmail || '',
        });
        setError('');
        setFormVisible(true);
    };

    const openDetailModal = async (request) => {
        setActionLoading(true);
        setError('');
        try {
            const data = await getSubscription(request.id);
            setSelectedRequest(data.subscription || request);
            setDetailVisible(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const updateRequestInList = (updated) => {
        setRequests((items) => items.map((item) => (item.id === updated.id ? updated : item)));
        setSelectedRequest(updated);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');

        if (!formData.ligne || !formData.dateDebut || !formData.dateFin || !formData.nom || !formData.prenom || !formData.ctt) {
            setError('Veuillez compléter les champs obligatoires.');
            setActionLoading(false);
            return;
        }

        try {
            if (formMode === 'edit' && selectedRequest) {
                const data = await updateSubscription(selectedRequest.id, formData);
                updateRequestInList(data.subscription);
                showSuccess('Demande modifiée avec succès.');
            } else {
                const data = await createSubscription({ ...formData, status: 'en_attente' });
                setRequests((items) => [data.subscription, ...items]);
                showSuccess('Demande ajoutée avec succès.');
            }
            setFormVisible(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleValidate = async (request) => {
        setActionLoading(true);
        setError('');
        try {
            const data = await validateSubscription(request.id);
            setRequests((items) => items.filter((item) => item.id !== request.id));
            setDetailVisible(false);
            showSuccess('Demande validée avec succès.');
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRefuse = async (request) => {
        if (!window.confirm('Confirmer le refus de cette demande ?')) {
            return;
        }

        setActionLoading(true);
        setError('');
        try {
            const data = await refuseSubscription(request.id);
            setRequests((items) => items.filter((item) => item.id !== request.id));
            setDetailVisible(false);
            showSuccess('Demande refusée.');
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (request) => {
        if (!window.confirm('Supprimer définitivement cette demande ?')) {
            return;
        }

        setActionLoading(true);
        setError('');
        try {
            await deleteSubscription(request.id);
            setRequests((items) => items.filter((item) => item.id !== request.id));
            setDetailVisible(false);
            showSuccess('Demande supprimée.');
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const renderStatus = (status) => {
        const colors = statusColors[status] || statusColors.en_attente;
        return (
            <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                background: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
            }}>
                {statusLabels[status] || status}
            </span>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                        Demandes d'abonnement
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: '8px 0 0' }}>
                        Consultez, modifiez, validez, refusez ou supprimez les demandes d'abonnement.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #F97316, #EA580C)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                    }}
                >
                    <Plus size={18} /> Ajouter une demande
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                    ['Total', stats.total],
                    ['En attente', stats.pending],
                    ['Validées', stats.validated],
                    ['Refusées', stats.refused],
                ].map(([label, value]) => (
                    <div key={label} style={{ background: '#ffffff', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 8px' }}>{label}</p>
                        <strong style={{ fontSize: '26px', color: '#1E293B' }}>{value}</strong>
                    </div>
                ))}
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

            {loading ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '60px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>Chargement des demandes...</p>
                </div>
            ) : (
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: '#FFF7ED', borderBottom: '1px solid #E2E8F0' }}>
                                    {['Utilisateur', 'Type', 'Date demande', 'Statut', 'Actions'].map((title) => (
                                        <th key={title} style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#F97316' }}>
                                            {title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                                            Aucune demande d'abonnement trouvée.
                                        </td>
                                    </tr>
                                ) : requests.map((request) => (
                                    <tr key={request.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '16px', color: '#1F2937', fontWeight: 500 }}>
                                            <p style={{ margin: 0, fontWeight: 600 }}>{request.prenom} {request.nom}</p>
                                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>{request.ctt}</p>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ display: 'inline-block', background: '#F97316', color: '#ffffff', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}>
                                                {request.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#6B7280' }}>{toInputDate(request.dateDemande)}</td>
                                        <td style={{ padding: '16px' }}>{renderStatus(request.status)}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                <button onClick={() => openDetailModal(request)} style={actionButtonStyle('#EEF2FF', '#4F46E5')} disabled={actionLoading}>
                                                    <Eye size={14} /> Voir
                                                </button>
                                                <button onClick={() => openEditModal(request)} style={actionButtonStyle('#FFF7ED', '#F97316')} disabled={actionLoading}>
                                                    <Edit2 size={14} /> Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleValidate(request)}
                                                    style={actionButtonStyle(
                                                        Number(request.prix) ? '#D1FAE5' : '#F3F4F6',
                                                        Number(request.prix) ? '#065F46' : '#9CA3AF',
                                                        !Number(request.prix)
                                                    )}
                                                    disabled={actionLoading || !Number(request.prix)}
                                                    title={!Number(request.prix) ? 'Renseignez le prix avant de valider' : 'Valider la demande'}
                                                >
                                                    <CheckCircle size={14} /> Valider
                                                </button>
                                                <button onClick={() => handleRefuse(request)} style={actionButtonStyle('#FEF2F2', '#DC2626')} disabled={actionLoading}>
                                                    <XCircle size={14} /> Refuser
                                                </button>
                                                <button onClick={() => handleDelete(request)} style={actionButtonStyle('#F3F4F6', '#374151')} disabled={actionLoading}>
                                                    <Trash2 size={14} /> Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal visible={detailVisible} title="Détails de la demande" onClose={() => setDetailVisible(false)}>
                {selectedRequest && (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <InfoSection title="Informations utilisateur" rows={[
                            ['Nom', selectedRequest.nom],
                            ['Prénom', selectedRequest.prenom],
                            ['Contact', selectedRequest.ctt],
                        ]} />
                        <InfoSection title="Détails abonnement" rows={[
                            ['Type', selectedRequest.type],
                            ['Ligne départ', selectedRequest.ligne],
                            ['Ligne arrivée', selectedRequest.ligneArrivee || '-'],
                            ['Prix', `${Number(selectedRequest.prix || 0).toFixed(2)} TND`],
                            ['Date début', toInputDate(selectedRequest.dateDebut)],
                            ['Date fin', toInputDate(selectedRequest.dateFin)],
                            ['Statut', statusLabels[selectedRequest.status] || selectedRequest.status],
                        ]} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button onClick={() => openEditModal(selectedRequest)} style={primaryButtonStyle('#F97316')} disabled={actionLoading}>Modifier</button>
                            <button
                                onClick={() => handleValidate(selectedRequest)}
                                style={primaryButtonStyle(Number(selectedRequest.prix) ? '#16A34A' : '#9CA3AF', !Number(selectedRequest.prix))}
                                disabled={actionLoading || !Number(selectedRequest.prix)}
                                title={!Number(selectedRequest.prix) ? 'Renseignez le prix avant de valider' : 'Valider la demande'}
                            >
                                Valider
                            </button>
                            <button onClick={() => handleRefuse(selectedRequest)} style={primaryButtonStyle('#DC2626')} disabled={actionLoading}>Refuser</button>
                            <button onClick={() => handleDelete(selectedRequest)} style={primaryButtonStyle('#374151')} disabled={actionLoading}>Supprimer</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                visible={formVisible}
                title={formMode === 'create' ? 'Ajouter une demande' : 'Modifier la demande'}
                onClose={() => setFormVisible(false)}
            >
                <form onSubmit={handleSave} style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <TextInput label="Nom" value={formData.nom} onChange={(value) => setFormData({ ...formData, nom: value })} />
                        <TextInput label="Prénom" value={formData.prenom} onChange={(value) => setFormData({ ...formData, prenom: value })} />
                    </div>
                    <TextInput label="Contact / email" value={formData.ctt} onChange={(value) => setFormData({ ...formData, ctt: value })} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={labelStyle}>Type d'abonnement</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={inputStyle} onFocus={focusOrange} onBlur={blurInput}>
                                <option>Mensuel</option>
                                <option>Annuel</option>
                                <option>Etudiant</option>
                                <option>Professionnel</option>
                            </select>
                        </div>
                        <TextInput label="Prix (TND)" type="number" value={formData.prix} onChange={(value) => setFormData({ ...formData, prix: Number(value) })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <TextInput label="Ligne départ" value={formData.ligne} onChange={(value) => setFormData({ ...formData, ligne: value })} />
                        <TextInput label="Ligne arrivée" value={formData.ligneArrivee} onChange={(value) => setFormData({ ...formData, ligneArrivee: value })} required={false} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <TextInput label="Date début" type="date" value={formData.dateDebut} onChange={(value) => setFormData({ ...formData, dateDebut: value })} />
                        <TextInput label="Date fin" type="date" value={formData.dateFin} onChange={(value) => setFormData({ ...formData, dateFin: value })} />
                    </div>
                    {formMode === 'edit' && (
                        <div>
                            <label style={labelStyle}>Statut</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={inputStyle} onFocus={focusOrange} onBlur={blurInput}>
                                <option value="en_attente">En attente</option>
                                <option value="validee">Validée</option>
                                <option value="refusee">Refusée</option>
                            </select>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={() => setFormVisible(false)} style={secondaryButtonStyle}>Annuler</button>
                        <button type="submit" disabled={actionLoading} style={primaryButtonStyle('#F97316')}>
                            {actionLoading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const actionButtonStyle = (background, color, disabled = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    background,
    color,
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.75 : 1,
});

const primaryButtonStyle = (background, disabled = false) => ({
    padding: '10px 18px',
    background,
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.75 : 1,
});

const secondaryButtonStyle = {
    padding: '10px 18px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
};

const TextInput = ({ label, value, onChange, type = 'text', required = true }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            style={inputStyle}
            onFocus={focusOrange}
            onBlur={blurInput}
        />
    </div>
);

const InfoSection = ({ title, rows }) => (
    <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0' }}>
        <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase' }}>
            {title}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {rows.map(([label, value]) => (
                <div key={label}>
                    <span style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>{label}</span>
                    <strong style={{ fontSize: '14px', color: '#1F2937' }}>{value || '-'}</strong>
                </div>
            ))}
        </div>
    </div>
);

export default SubscriptionRequests;
