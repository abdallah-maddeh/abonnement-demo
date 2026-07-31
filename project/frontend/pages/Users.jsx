import { useEffect, useMemo, useState } from 'react';
import { getCurrentUser, getUsers, createUser, updateUser, updateUserStatus } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, UserRoundCheck, UserRoundX, User2 } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [statusVisible, setStatusVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ prenom: '', nom: '', email: '', role: 'utilisateur', mot_de_passe: '1234' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const currentUser = getCurrentUser();

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await getUsers();
                setUsers(response.users || []);
            } catch (err) {
                setError(err.message);
            }
        };

        loadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const term = search.toLowerCase();
            return (
                user.nom.toLowerCase().includes(term) ||
                user.prenom.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                user.role.toLowerCase().includes(term)
            );
        });
    }, [search, users]);

    const openAddModal = () => {
        setSelectedUser(null);
        setFormData({ prenom: '', nom: '', email: '', role: 'utilisateur', mot_de_passe: '1234' });
        setSuccess('');
        setError('');
        setModalVisible(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({ prenom: user.prenom, nom: user.nom, email: user.email, role: user.role, mot_de_passe: '' });
        setSuccess('');
        setError('');
        setModalVisible(true);
    };

    const openStatusModal = (user) => {
        setSelectedUser(user);
        setStatusVisible(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.prenom || !formData.nom || !formData.email) {
            setError('Tous les champs sont requis.');
            setLoading(false);
            return;
        }

        try {
            if (selectedUser) {
                const response = await updateUser(selectedUser.id, formData);
                setUsers(users.map((user) => (user.id === selectedUser.id ? response.user : user)));
                setSuccess('Utilisateur mis à jour avec succès.');
            } else {
                const response = await createUser(formData);
                setUsers([response.user, ...users]);
                setSuccess('Utilisateur ajouté avec succès.');
            }
            setModalVisible(false);
        } catch (err) {
            setError(err.message);
            setStatusVisible(false);
            setSelectedUser(null);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async () => {
        setLoading(true);
        setError('');
        try {
            const nextStatus = !selectedUser.actif;
            const response = await updateUserStatus(selectedUser.id, nextStatus);
            setUsers(users.map((user) => (user.id === selectedUser.id ? response.user : user)));
            setStatusVisible(false);
            setSuccess(nextStatus ? 'Compte utilisateur activé.' : 'Compte utilisateur désactivé.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div style={{
                padding: '40px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh'
            }}>
                <div style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    maxWidth: '500px',
                    border: '1px solid #E2E8F0'
                }}>
                    <div style={{
                        background: '#FFF7ED',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <User2 size={32} color="#F97316" />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', margin: '0 0 10px' }}>Accès réservé</h2>
                    <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>Seuls les administrateurs peuvent gérer les comptes utilisateurs.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', margin: 0 }}>Gestion des utilisateurs</h1>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: '8px 0 0' }}>Ajouter, modifier, activer et désactiver des comptes utilisateurs</p>
                </div>
                <button
                    onClick={openAddModal}
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
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.88';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'none';
                    }}
                >
                    <Plus size={18} /> Ajouter un utilisateur
                </button>
            </div>

            {/* Search Bar */}
            <div style={{
                marginBottom: '24px',
                position: 'relative'
            }}>
                <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <Search size={18} style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9CA3AF'
                    }} />
                    <input
                        type="search"
                        placeholder="Rechercher un utilisateur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px 10px 40px',
                            border: '1.5px solid #E2E8F0',
                            borderRadius: '10px',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#F97316';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div style={{
                    background: '#FEE2E2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '13px'
                }}>
                    ✕ {error}
                </div>
            )}
            {success && (
                <div style={{
                    background: '#DBEAFE',
                    border: '1px solid #BFDBFE',
                    color: '#1E40AF',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '13px'
                }}>
                    ✓ {success}
                </div>
            )}

            {/* Table */}
            <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                    }}>
                        <thead>
                            <tr style={{
                                background: '#FFF7ED',
                                borderBottom: '1px solid #E2E8F0'
                            }}>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#F97316'
                                }}>Nom</th>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#F97316'
                                }}>Email</th>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#F97316'
                                }}>Rôle</th>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#F97316'
                                }}>Statut</th>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#F97316'
                                }}>Date</th>
                                <th style={{
                                    padding: '16px',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: '#F97316'
                                }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{
                                        padding: '40px',
                                        textAlign: 'center',
                                        color: '#9CA3AF'
                                    }}>
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} style={{
                                        borderBottom: '1px solid #F8FAFC',
                                        transition: 'background 0.2s ease'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#FFFBF7'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '16px', color: '#1F2937', fontWeight: '500' }}>
                                            {user.prenom} {user.nom}
                                        </td>
                                        <td style={{ padding: '16px', color: '#6B7280' }}>
                                            {user.email}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: user.role === 'admin' ? '#FFF7ED' : '#F0FDF4',
                                                color: user.role === 'admin' ? '#F97316' : '#16A34A',
                                                border: user.role === 'admin' ? '1px solid #FDBA74' : '1px solid #86EFAC'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: user.actif ? '#F0FDF4' : '#FEF2F2',
                                                color: user.actif ? '#16A34A' : '#DC2626',
                                                border: user.actif ? '1px solid #86EFAC' : '1px solid #FECACA'
                                            }}>
                                                {user.actif ? 'Actif' : 'Désactivé'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#6B7280', fontSize: '13px' }}>
                                            {user.dateCreation}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '7px 14px',
                                                        background: '#EEF2FF',
                                                        color: '#6366F1',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#6366F1';
                                                        e.currentTarget.style.color = '#ffffff';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#EEF2FF';
                                                        e.currentTarget.style.color = '#6366F1';
                                                    }}
                                                >
                                                    <Edit2 size={14} /> Modifier
                                                </button>
                                                <button
                                                    onClick={() => openStatusModal(user)}
                                                    disabled={user.id === currentUser.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '7px 14px',
                                                        background: user.actif ? '#FEF2F2' : '#F0FDF4',
                                                        color: user.actif ? '#DC2626' : '#16A34A',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: user.id === currentUser.id ? 'not-allowed' : 'pointer',
                                                        opacity: user.id === currentUser.id ? 0.45 : 1,
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (user.id === currentUser.id) return;
                                                        e.currentTarget.style.background = user.actif ? '#DC2626' : '#16A34A';
                                                        e.currentTarget.style.color = '#ffffff';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = user.actif ? '#FEF2F2' : '#F0FDF4';
                                                        e.currentTarget.style.color = user.actif ? '#DC2626' : '#16A34A';
                                                    }}
                                                >
                                                    {user.actif ? <UserRoundX size={14} /> : <UserRoundCheck size={14} />}
                                                    {user.actif ? 'Désactiver' : 'Activer'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                title={selectedUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                onClose={() => setModalVisible(false)}
            >
                <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Prénom</label>
                        <input
                            type="text"
                            value={formData.prenom}
                            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1.5px solid #E2E8F0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#F97316';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#E2E8F0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Nom</label>
                        <input
                            type="text"
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1.5px solid #E2E8F0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#F97316';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#E2E8F0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1.5px solid #E2E8F0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#F97316';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#E2E8F0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Rôle</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1.5px solid #E2E8F0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#F97316';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#E2E8F0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <option value="admin">Admin</option>
                            <option value="utilisateur">Utilisateur</option>
                        </select>
                    </div>
                    {!selectedUser && (
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>Mot de passe</label>
                            <input
                                type="text"
                                value={formData.mot_de_passe}
                                onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#F97316';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                            type="button"
                            onClick={() => setModalVisible(false)}
                            style={{
                                padding: '10px 20px',
                                background: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                background: loading ? '#FDBF8A' : '#F97316',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.opacity = '0.88';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                            }}
                        >
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Account status modal */}
            <Modal
                visible={statusVisible}
                title={selectedUser?.actif ? 'Désactiver le compte' : 'Activer le compte'}
                onClose={() => setStatusVisible(false)}
            >
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#374151', margin: '0 0 16px' }}>
                        {selectedUser?.actif
                            ? <>Désactiver le compte de <strong>{selectedUser?.prenom} {selectedUser?.nom}</strong> ? Ses données et abonnements seront conservés, mais la connexion sera bloquée.</>
                            : <>Réactiver le compte de <strong>{selectedUser?.prenom} {selectedUser?.nom}</strong> ? L’utilisateur pourra de nouveau se connecter.</>}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => setStatusVisible(false)}
                        style={{
                            padding: '10px 20px',
                            background: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleStatusChange}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            background: loading ? '#CBD5E1' : (selectedUser?.actif ? '#DC2626' : '#16A34A'),
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.opacity = '0.88';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                        }}
                    >
                        {loading ? 'Mise à jour...' : (selectedUser?.actif ? 'Désactiver' : 'Activer')}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Users;
