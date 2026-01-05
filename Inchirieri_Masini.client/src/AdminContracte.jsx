import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminContracte.css';

function AdminContracte() {
    const navigate = useNavigate();
    const [contracte, setContracte] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState(null);

    const [predareData, setPredareData] = useState({
        avans: '',
        metodaPlata: 'Card'
    });

    const [finalizareData, setFinalizareData] = useState({
        dataEfectiva: new Date().toISOString().split('T')[0],
        penalizare: 0,
        restPlata: '',
        metodaPlata: 'Card',
        observatii: ''
    });

    const incarcaContracte = async () => {
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
        incarcaContracte();
    }, []);

    const handleOpenModal = (contract) => {
        setSelectedContract(contract);
        setPredareData({ avans: '', metodaPlata: 'Card' });
        
        const restCalculat = Math.round(contract.sumaTotala - (contract.avans || 0));
        setFinalizareData({
            dataEfectiva: new Date().toISOString().split('T')[0],
            penalizare: 0,
            restPlata: restCalculat,
            metodaPlata: 'Card',
            observatii: ''
        });
    };

    const handleSchimbaStatus = async (id, status) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/AdminContract/schimba-status/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(status)
            });

            if (response.ok) {
                alert(`Status actualizat: ${status}`);
                incarcaContracte();
                setSelectedContract(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleIncaseazaSiPreda = async (id) => {
        if (!predareData.avans) {
            alert("Te rog introdu valoarea avansului încasat!");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/AdminContract/incaseaza-avans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    iD_Contract: id,
                    sumaAvans: parseInt(predareData.avans),
                    metodaPlata: predareData.metodaPlata
                })
            });

            if (response.ok) {
                alert("Avans încasat și mașină predată!");
                incarcaContracte();
                setSelectedContract(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleFinalizeaza = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/AdminContract/finalizeaza', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    iD_Contract: id,
                    data_Returnare_Efectiva: finalizareData.dataEfectiva,
                    suma_Penalizare: parseInt(finalizareData.penalizare) || 0,
                    rest: parseInt(finalizareData.restPlata) || 0,
                    metodaPlataRest: finalizareData.metodaPlata,
                    observatii_Returnare: finalizareData.observatii
                })
            });

            if (response.ok) {
                alert("Contract finalizat cu succes!");
                incarcaContracte();
                setSelectedContract(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEmitereProcesVerbal = (id, e) => {
        e.stopPropagation();
        alert(`📄 S-a generat Procesul Verbal de Predare pentru contractul #${id}!`);
    };

    const handleEmitereFactura = (contract) => {
        const total = (contract.avans || 0) + (parseInt(finalizareData.restPlata) || 0) + (parseInt(finalizareData.penalizare) || 0);
        alert(`📄 Factură Generată:\nClient: ${contract.numeClient}\nTotal General: ${total} EURO`);
    };

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ro-RO') : '-';

    const getStatusClass = (status) => {
        switch(status?.toUpperCase()) {
            case 'ACTIV': return 'status-activ'; 
            case 'ACCEPTAT': return 'status-acceptat'; 
            case 'IN INCHIRIERE': return 'status-predat';
            case 'ANULAT': case 'REFUZAT': return 'status-anulat'; 
            case 'FINALIZAT': return 'status-finalizat'; 
            default: return '';
        }
    };

    return (
        <div className="contracts-container">
            <div className="contracts-card">
                <div className="contracts-header">
                    <button className="back-btn-simple" onClick={() => navigate('/acasa')}>&larr; Înapoi</button>
                    <h1>Registru Contracte</h1>
                </div>

                {loading ? <div className="loading-txt">Se încarcă datele...</div> : (
                    <div className="table-responsive">
                        <table className="contracts-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Client</th>
                                    <th>Mașina</th>
                                    <th>Perioada</th>
                                    <th>Status</th>
                                    <th>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contracte.map((c) => (
                                    <tr key={c.iD_Contract}>
                                        <td className="fw-bold">#{c.iD_Contract}</td>
                                        <td>{c.numeClient}</td>
                                        <td>{c.modelMasina}</td>
                                        <td>{formatDate(c.data_Inchiriere)} — {formatDate(c.data_Returnare)}</td>
                                        <td><span className={`status-badge ${getStatusClass(c.status)}`}>{c.status}</span></td>
                                        <td>
                                            <div className="actions-cell">
                                                <button className="btn-details-small" onClick={() => handleOpenModal(c)}>
                                                    👁️ Gestionează
                                                </button>
                                                {c.status === 'In inchiriere' && (
                                                    <button className="btn-emitere-small" onClick={(e) => handleEmitereProcesVerbal(c.iD_Contract, e)}>
                                                        📄 Emitere
                                                    </button>
                                                )}
                                            </div>
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
                            <h3>Contract #{selectedContract.iD_Contract} - {selectedContract.numeClient}</h3>
                            <button className="close-x" onClick={() => setSelectedContract(null)}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <p style={{textAlign:'center', marginBottom: '20px'}}>
                                Status: <span className={`status-badge ${getStatusClass(selectedContract.status)}`} style={{fontSize:'0.9rem'}}>{selectedContract.status}</span>
                            </p>
                            
                            {selectedContract.status?.toUpperCase() === 'ACTIV' && (
                                <div className="action-section">
                                    <p className="info-text">Dorești să aprobi această cerere de închiriere?</p>
                                    <div className="btn-row">
                                        <button className="btn-accept" onClick={() => handleSchimbaStatus(selectedContract.iD_Contract, 'Acceptat')}>✅ Acceptă</button>
                                        <button className="btn-refuse" onClick={() => handleSchimbaStatus(selectedContract.iD_Contract, 'Refuzat')}>❌ Refuză</button>
                                    </div>
                                </div>
                            )}

                            {selectedContract.status?.toUpperCase() === 'ACCEPTAT' && (
                                <div className="action-section">
                                    <p className="info-text">Pentru a preda mașina, încasează avansul:</p>
                                    <div className="mini-form">
                                        <div className="form-group">
                                            <label>Avans (EURO):</label>
                                            <input type="number" placeholder="ex: 50" value={predareData.avans} onChange={e => setPredareData({...predareData, avans: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Metoda Plată:</label>
                                            <select value={predareData.metodaPlata} onChange={e => setPredareData({...predareData, metodaPlata: e.target.value})}>
                                                <option value="Card">Card</option>
                                                <option value="Numerar">Numerar</option>
                                                <option value="Transfer">Transfer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button className="btn-predare" onClick={() => handleIncaseazaSiPreda(selectedContract.iD_Contract)}>
                                        💰 Încasează & Predă Cheile
                                    </button>
                                </div>
                            )}

                            {selectedContract.status === 'In inchiriere' && (
                                <div className="finalizare-form">
                                    <h4>Retur Mașină & Finalizare</h4>
                                    <div className="form-group">
                                        <label>Data Returnare Efectivă:</label>
                                        <input type="date" value={finalizareData.dataEfectiva} onChange={e => setFinalizareData({...finalizareData, dataEfectiva: e.target.value})} />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Rest de Plată (EURO):</label>
                                            <input type="number" value={finalizareData.restPlata} onChange={e => setFinalizareData({...finalizareData, restPlata: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Penalizare (EURO):</label>
                                            <input type="number" value={finalizareData.penalizare} onChange={e => setFinalizareData({...finalizareData, penalizare: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Metoda Plată Rest:</label>
                                        <select value={finalizareData.metodaPlata} onChange={e => setFinalizareData({...finalizareData, metodaPlata: e.target.value})}>
                                            <option value="Card">Card</option>
                                            <option value="Numerar">Numerar</option>
                                            <option value="Transfer">Transfer</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Observații:</label>
                                        <textarea placeholder="Stare mașină, zgârieturi, nivel combustibil..." value={finalizareData.observatii} onChange={e => setFinalizareData({...finalizareData, observatii: e.target.value})} />
                                    </div>
                                    <button className="btn-finalize-action" onClick={() => handleFinalizeaza(selectedContract.iD_Contract)}>
                                        🏁 Finalizează Contractul
                                    </button>
                                </div>
                            )}

                            {selectedContract.status === 'Finalizat' && (
                            <div className="invoice-section">
                                <div className="success-box" style={{ backgroundColor: '#e2f0e9', borderLeft: '5px solid #198754', padding: '20px', borderRadius: '8px' }}>
                                    <p style={{ margin: '5px 0' }}><strong>Avans Încasat:</strong> {selectedContract.avans} EURO</p>
                                    <p style={{ margin: '5px 0' }}><strong>Rest + Penalizari:</strong> {selectedContract.rest + selectedContract.penalizare} EURO</p>
                                    
                                    <div style={{ borderTop: '1px solid #ced4da', marginTop: '10px', paddingTop: '10px' }}>
                                        <p style={{ fontSize: '1.4em', fontWeight: '800', color: '#444', textAlign: 'center', margin: 0 }}>
                                            TOTAL ÎNCASAT: {selectedContract.avans + selectedContract.rest + selectedContract.penalizare} EURO
                                        </p>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                    <button className="btn-invoice" onClick={() => handleEmitereFactura(selectedContract)}>
                                        📄 Emite Factura
                                    </button>
                                </div>
                            </div>
                        )}

                            {(selectedContract.status === 'ANULAT' || selectedContract.status === 'Refuzat') && <div className="error-box">Contract Anulat/Refuzat.</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminContracte;