import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminContracte.css';

function AdminContracte() {
    const navigate = useNavigate();
    const [contracte, setContracte] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState(null);
    const [finalizareData, setFinalizareData] = useState({
        dataEfectiva: new Date().toISOString().split('T')[0],
        penalizare: 0,
        observatii: ''
    });

    const fetchContracte = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/AdminContract', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setContracte(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracte();
    }, []);

    const handleAccepta = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/AdminContract/accepta/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Contract acceptat!");
                setSelectedContract(null);
                fetchContracte();
            }
        } catch (error) {
            alert("Eroare la acceptare.");
        }
    };

    const handleFinalizeaza = async (contractId) => {
        const token = localStorage.getItem('token');
        const body = {
            ID_Contract: contractId,
            Data_Returnare_Efectiva: finalizareData.dataEfectiva,
            Suma_Penalizare: parseInt(finalizareData.penalizare),
            Rest: 0,
            Observatii_Returnare: finalizareData.observatii || "Fără observații"
        };

        try {
            const res = await fetch('/api/AdminContract/finalizeaza', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert("Contract finalizat!");
                setSelectedContract(null);
                fetchContracte();
            }
        } catch (error) {
            alert("Eroare la finalizare.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ro-RO');
    };

    return (
        <div className="contracts-container">
            <div className="contracts-card">
                <div className="contracts-header">
                    <button className="back-btn-simple" onClick={() => navigate('/acasa')}>&larr; Înapoi</button>
                    <h1>Registru Contracte</h1>
                </div>

                {loading ? (
                    <div className="loading-txt">Se încarcă datele...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="contracts-table">
                            <thead>
                                <tr>
                                    <th>ID Contract</th>
                                    <th>Client (ID)</th>
                                    <th>Mașina (ID)</th>
                                    <th>Perioada</th>
                                    <th>Status</th>
                                    <th>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contracte.map((c) => (
                                    <tr key={c.iD_Contract}>
                                        <td className="fw-bold">{c.iD_Contract}</td>
                                        <td>{c.numeClient || "Client necunoscut"}</td>
                                        <td>{c.modelMasina || "Mașină necunoscută"}</td>
                                        
                                        <td>{formatDate(c.data_Inchiriere)} — {formatDate(c.data_Returnare)}</td>
                                        <td>
                                            <span className={`status-badge ${c.status ? c.status.toLowerCase() : ''}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-details-small" onClick={() => setSelectedContract(c)}>
                                                👁️ Detalii
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedContract && (
                <div className="modal-overlay" onClick={() => setSelectedContract(null)}>
                    <div className="modal-content contract-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h3>Gestionare ID: {selectedContract.iD_Contract}</h3>
                            <button className="close-x" onClick={() => setSelectedContract(null)}>×</button>
                        </div>
                        <div className="contract-details-grid">
                            {selectedContract.status === 'Activ' && (
                                <button className="btn-confirm-action" onClick={() => handleAccepta(selectedContract.iD_Contract)}>✅ Acceptă Contractul</button>
                            )}
                            {selectedContract.status === 'Acceptat' && (
                                <div className="finalizare-form">
                                    <input type="date" value={finalizareData.dataEfectiva} onChange={e => setFinalizareData({...finalizareData, dataEfectiva: e.target.value})} />
                                    <input type="number" placeholder="Penalizare" onChange={e => setFinalizareData({...finalizareData, penalizare: e.target.value})} />
                                    <textarea placeholder="Observații" onChange={e => setFinalizareData({...finalizareData, observatii: e.target.value})} />
                                    <button className="btn-finalize-action" onClick={() => handleFinalizeaza(selectedContract.iD_Contract)}>🏁 Finalizează</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminContracte;