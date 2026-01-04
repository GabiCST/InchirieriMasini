import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CarDetails.css';

function CarDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [masina, setMasina] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchMasina = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`/api/Masini/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Mașina nu a fost găsită sau a apărut o eroare.');
                }

                const data = await response.json();
                setMasina(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMasina();
    }, [id, navigate]);
    const handleInchiriere = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/User/GetDetalii', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 404 || response.status === 204) {
                alert("⚠ Nu poți închiria fără datele din buletin/permis! Te redirecționăm...");
                navigate('/date-personale');
                return;
            }
            
            const data = await response.json();
            if (!data.ci || !data.serie_Carnet) {
                 alert("⚠ Datele tale sunt incomplete! Te rugăm să le completezi.");
                 navigate('/date-personale');
                 return;
            }
            alert(`Cerere de închiriere trimisă pentru ${masina.model}! (Aici vei lega API-ul de Contracte)`);

        } catch (error) {
            console.error("Eroare verificare user:", error);
            alert("Eroare la verificarea profilului.");
        }
    };

    if (loading) return <div className="loading-center">Se încarcă detaliile...</div>;
    if (error) return <div className="error-center">Eroare: {error} <button onClick={() => navigate('/acasa')}>Înapoi</button></div>;
    if (!masina) return null;

    return (
        <div className="details-container">
            <button className="back-btn" onClick={() => navigate('/acasa')}>&larr; Înapoi la listă</button>
            
            <div className="details-card">
                <div className="details-image-section">
                    <img 
                        src={masina.img || masina.poza || 'https://via.placeholder.com/600x400'} 
                        alt={masina.model} 
                        className="main-car-image"
                    />
                </div>
                <div className="details-info-section">
                    <h1 className="car-title">{masina.model}</h1>
                    <div className="car-price">
                        {masina.pret || masina.tarif_Inchiriere}€ <span className="per-day">/ zi</span>
                    </div>

                    <div className="car-specs-grid">
                        <div className="spec-box">
                            <span className="label">Motorizare</span>
                            <span className="value">{masina.motorizare}</span>
                        </div>
                        <div className="spec-box">
                            <span className="label">An Fabricație</span>
                            <span className="value">{masina.an || masina.anFabricatie}</span>
                        </div>
                        <div className="spec-box">
                            <span className="label">Număr</span>
                            <span className="value">{masina.numar_Inmatriculare || masina.numar_Matricula}</span>
                        </div>
                    </div>
                    <p className="car-description">
                        Această mașină este disponibilă imediat. Beneficiezi de asigurare inclusă, 
                        asistență rutieră 24/7 și km nelimitați. Perfectă pentru drumurile tale!
                    </p>

                    <div className="action-area">
                        <button className="rent-btn" onClick={handleInchiriere}>
                            ÎNCHIRIAZĂ ACUM
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CarDetails;