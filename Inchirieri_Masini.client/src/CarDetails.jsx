import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CarDetails.css';

function CarDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- DATE HARDCODATE ---
    const masina = {
        id: id,
        model: "Volkswagen Arteon R-Line",
        poza: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        pret: 90,
        motorizare: "2.0 TSI 280CP",
        an: 2025,
        nrInmatriculare: "B 99 WOW",
        descriere: "Aceasta este o versiune demonstrativă. Mașina vine echipată cu pachet R-Line, trapă panoramică, sistem audio Harman Kardon și pilot automat adaptiv. Ideală pentru drumuri lungi și confort maxim.",
        
        // Date pentru partea de jos
        dotari: [
            "Transmisie Automată DSG",
            "Scaune Încălzite & Ventilate",
            "Sistem Navigație GPS",
            "Apple CarPlay / Android Auto",
            "Cameră 360 grade",
            "Senzori Parcare",
            "Isofix (Scaun Copil)",
            "Climă pe 3 Zone"
        ],
        conditii: [
            "Vârsta minimă: 21 ani",
            "Permis de conducere: min. 1 an vechime",
            "Depozit garanție: 200€ (returnabil)",
            "Politica de combustibil: Plin la Plin",
            "Fumatul interzis în mașină",
            "Km nelimitați pe teritoriul țării"
        ]
    };

    const handleInchiriere = () => {
        const confirma = window.confirm("Vrei să mergi la pagina de Date Personale?");
        if (confirma) {
            navigate('/date-personale');
        }
    };

    return (
        <div className="details-container">
            <div className="content-wrapper">
                <button className="back-btn" onClick={() => navigate('/acasa')}>&larr; Înapoi la listă</button>
                
                {/* --- CARDUL PRINCIPAL (SUS) --- */}
                <div className="details-card">
                    <div className="details-image-section">
                        <img src={masina.poza} alt={masina.model} className="main-car-image"/>
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
                                <span className="value">{masina.nrInmatriculare}</span>
                            </div>
                        </div>

                        <p className="car-description">{masina.descriere}</p>

                        <div className="action-area">
                            <button className="rent-btn" onClick={handleInchiriere}>ÎNCHIRIAZĂ ACUM</button>
                        </div>
                    </div>
                </div>

                {/* --- SECTIUNEA DE JOS: INFORMATII & CONDITII --- */}
                <h2 className="section-header">Informații Suplimentare</h2>
                
                <div className="info-grid">
                    
                    {/* CARD STÂNGA: DOTĂRI */}
                    <div className="info-card">
                        <h3>✨ Dotări și Facilități</h3>
                        <div className="features-list">
                            {masina.dotari.map((dotare, index) => (
                                <div key={index} className="feature-item">
                                    <span className="check-icon">✓</span> {dotare}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CARD DREAPTA: CONDIȚII */}
                    <div className="info-card">
                        <h3>📋 Condiții de Închiriere</h3>
                        <ul className="conditions-list">
                            {masina.conditii.map((cond, index) => (
                                <li key={index}>{cond}</li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default CarDetails;