import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContracteleMele.css';

function ContracteleMele() {
    const [contracte, setContracte] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchContracte = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/Contracte/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setContracte(data);
            }
        } catch (error) {
            console.error("Eroare la preluarea contractelor:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracte();
    }, []);

    const handleAnulare = async (id) => {
        if (!window.confirm("Sigur dorești să anulezi acest contract?")) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/Contracte/anulare/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert("✅ Contract anulat cu succes.");
                fetchContracte(); 
            } else {
                alert("❌ Eroare la anulare. Încercați din nou.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="loading-screen">Se încarcă istoricul...</div>;

    return (
        <div className="my-contracts-page">
            <nav className="contracts-nav">
                <button className="back-home-btn" onClick={() => navigate('/acasa')}>
                    &larr; Înapoi
                </button>
                <h1>Istoricul închirierilor mele</h1>
                <div className="nav-placeholder"></div>
            </nav>

            <main className="contracts-content">
                {contracte.length > 0 ? (
                    <div className="contracts-grid-custom">
                        {contracte.map((c) => (
                            <div key={c.id_Contract} className="contract-card-custom">
                                <div className="card-header-custom">
                                    <span className={`status-pill ${c.status_Contract ? c.status_Contract.toLowerCase() : ''}`}>
                                        {c.status_Contract}
                                    </span>
                                    <span className="price-bold">{c.suma_Totala_Estimata} €</span>
                                </div>

                                <div className="card-body-custom">
                                    <h3>{c.modelMasina || "Model Necunoscut"}</h3>
                                    <p className="plate-text">Număr: <strong>{c.numarMasina || "---"}</strong></p>
                                    
                                    <div className="date-info-grid">
                                        <div className="date-item">
                                            <label>Ridicare</label>
                                            <span>{new Date(c.data_Inchiriere).toLocaleDateString('ro-RO')}</span>
                                        </div>
                                        <div className="date-item">
                                            <label>Returnare</label>
                                            <span>{new Date(c.data_Returnare).toLocaleDateString('ro-RO')}</span>
                                        </div>
                                    </div>
                                </div>
                                {c.status_Contract === 'Activ' && (
                                    <button className="cancel-contract-btn" onClick={() => handleAnulare(c.id_Contract)}>
                                        Anulează Rezervarea
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-contracts">
                        <span className="empty-icon">🚗💨</span>
                        <h2>Nu aveți închiriate mașini momentan.</h2>
                        <button className="btn-explore" onClick={() => navigate('/acasa')}>
                            Explorează flota
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ContracteleMele;