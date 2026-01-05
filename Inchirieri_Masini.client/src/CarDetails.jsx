import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CarDetails.css';

function CarDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const [masina, setMasina] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [dates, setDates] = useState({ startDate: '', endDate: '' });
    const [totalPrice, setTotalPrice] = useState(0);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchDetalii = async () => {
            try {
                const response = await fetch(`/api/DetaliiMasina/${id}`);
                if (!response.ok) {
                    throw new Error("Mașina nu a fost găsită.");
                }
                const data = await response.json();
                setMasina(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetalii();
    }, [id]);

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setDates({ startDate: '', endDate: '' });
        setTotalPrice(0);
    };
    
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        const newDates = { ...dates, [name]: value };
        setDates(newDates);
        if (newDates.startDate && newDates.endDate) {
            const start = new Date(newDates.startDate);
            const end = new Date(newDates.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            if (end >= start) {
                const daysToPay = diffDays === 0 ? 1 : diffDays;
                setTotalPrice(daysToPay * masina.pret);
            } else {
                setTotalPrice(0); 
            }
        } else {
            setTotalPrice(0);
        }
    };

    const submitContract = async () => {
        if (!dates.startDate || !dates.endDate) {
            alert("Te rugăm să selectezi perioada!");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const responseProfil = await fetch('/api/Profil/detalii', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (responseProfil.ok) {
                const profil = await responseProfil.json();
                const idClientFinal = profil.userId || profil.id_Client || profil.id;
                const esteProfilIncomplet = !profil.ci || !profil.adresa || !profil.serie_carnet;

                const dateRezervare = { 
                    state: { 
                        carId: masina.id, 
                        model: masina.model,
                        startDate: dates.startDate,
                        endDate: dates.endDate,
                        totalPrice: totalPrice,
                        pricePerDay: masina.pret
                    } 
                };

                if (esteProfilIncomplet) {
                    navigate('/date-personale', dateRezervare);
                } else {
                    const contractData = {
                        id_Client: idClientFinal, 
                        id_Autovehicul: parseInt(id),
                        data_Intocmiri: new Date().toISOString(),
                        data_Inchiriere: dates.startDate,
                        data_Returnare: dates.endDate,
                        status_Contract: "Activ",
                        suma_Totala_Estimata: totalPrice
                    };

                    const responseContract = await fetch('/api/Contracte', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(contractData)
                    });

                    if (responseContract.ok) {
                        alert("Închiriere realizată cu succes!");
                        navigate('/acasa'); 
                    } else {
                        const errorData = await responseContract.json();
                        alert("Eroare la server: " + (errorData.message || "Eroare necunoscută"));
                    }
                }
            }
        } catch (error) {
            console.error("Eroare la procesarea închirierii:", error);
            alert("A apărut o eroare tehnică.");
        }
    };

    if (loading) return <div className="loading-screen">Se încarcă detaliile mașinii...</div>;
    if (error) return <div className="error-screen">Eroare: {error}</div>;
    if (!masina) return <div className="error-screen">Nu s-au găsit date.</div>;

    return (
        <div className="details-container">
            <div className={`content-wrapper ${showModal ? 'blur-background' : ''}`}>
                <button className="back-btn" onClick={() => navigate('/acasa')}>&larr; Înapoi la listă</button>
                
                <div className="details-card">
                    <div className="details-image-section">
                        <img src={masina.img} alt={masina.model} className="main-car-image"/>
                    </div>

                    <div className="details-info-section">
                        <h1 className="car-title">{masina.model}</h1>
                        <div className="car-price">
                            {masina.pret}€ <span className="per-day">/ zi</span>
                        </div>

                        <div className="car-specs-grid">
                            <div className="spec-box">
                                <span className="label">Motorizare</span>
                                <span className="value">{masina.motorizare}</span>
                            </div>
                            <div className="spec-box">
                                <span className="label">An Fabricație</span>
                                <span className="value">{masina.an}</span>
                            </div>
                            <div className="spec-box">
                                <span className="label">Număr</span>
                                <span className="value">{masina.numar_Inmatriculare}</span>
                            </div>
                        </div>

                        <p className="car-description">{masina.descriere}</p>

                        <div className="action-area">
                            {isAdmin ? (
                                <button 
                                    className="rent-btn admin-modify-btn" 
                                    onClick={() => navigate(`/modifica-masina/${id}`)}
                                >
                                    ✏️ Modifică Datele Mașinii
                                </button>
                            ) : (
                                <button className="rent-btn" onClick={handleOpenModal}>
                                    ÎNCHIRIAZĂ ACUM
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <h2 className="section-header">Informații Suplimentare</h2>
                <div className="info-grid">
                    <div className="info-card">
                        <h3>✨ Dotări și Facilități</h3>
                        <div className="features-list">
                            {masina.dotari && masina.dotari.length > 0 ? (
                                masina.dotari.map((dotare, index) => (
                                    <div key={index} className="feature-item">
                                        <span className="check-icon">✓</span> {dotare}
                                    </div>
                                ))
                            ) : <p>Nu sunt dotări specificate.</p>}
                        </div>
                    </div>

                    <div className="info-card">
                        <h3>📋 Condiții de Închiriere</h3>
                        <ul className="conditions-list">
                            {masina.conditii && masina.conditii.length > 0 ? (
                                masina.conditii.map((cond, index) => (
                                    <li key={index}>{cond}</li>
                                ))
                            ) : <p>Nu sunt condiții specifice.</p>}
                        </ul>
                    </div>

                    <div className="info-card wide-card">
                        <h3>🚗 Istoric Evenimente Rutiere</h3>
                        <div className="events-container">
                            {masina.evenimente && masina.evenimente.length > 0 ? (
                                masina.evenimente.map((ev, index) => (
                                    <div key={index} className="event-row">
                                        <div className="event-main">
                                            <span className="event-badge">{ev.tip}</span>
                                            <span className="event-date">{new Date(ev.data).toLocaleDateString('ro-RO')}</span>
                                            <span className="event-location">📍 {ev.locatie}</span>
                                        </div>
                                        <p className="event-desc">{ev.descriere}</p>
                                        <div className="event-footer">
                                            Cost reparație: <span className="event-cost">{ev.cost}€</span>
                                        </div>
                                    </div>
                                ))
                            ) : <p className="no-data">Niciun eveniment rutier înregistrat pentru acest autovehicul.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Configurează Închirierea</h3>
                        <p>Alege perioada dorită pentru <strong>{masina.model}</strong></p>
                        <div className="date-inputs">
                            <label>
                                Data Preluare:
                                <input 
                                    type="date" 
                                    name="startDate"
                                    value={dates.startDate} 
                                    min={today}
                                    onChange={handleDateChange} 
                                    required 
                                />
                            </label>
                            <label>
                                Data Returnare:
                                <input 
                                    type="date" 
                                    name="endDate"
                                    value={dates.endDate} 
                                    min={dates.startDate || today}
                                    disabled={!dates.startDate}
                                    onChange={handleDateChange} 
                                    required 
                                />
                            </label>
                        </div>
                        <div className="price-summary">
                            <p>Preț pe zi: <strong>{masina.pret}€</strong></p>
                            <p className="total-highlight">Total estimat: {totalPrice}€</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={handleCloseModal}>Anulează</button>
                            <button className="btn-confirm" onClick={submitContract}>Confirmă & Închiriază</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CarDetails;