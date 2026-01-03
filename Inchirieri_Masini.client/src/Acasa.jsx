import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Acasa.css';

function Acasa() {
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const carsPerPage = 6;
    const [masini] = useState([
        { id: 1, marca: 'BMW', model: 'Seria 3', an: 2021, matriculare: 'B 101 BMW', pret: 50, img: 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&w=400&q=80', dotari: ['Navigație', 'Automată'] },
        { id: 2, marca: 'Audi', model: 'A4', an: 2020, matriculare: 'CJ 20 AUD', pret: 45, img: 'https://images.unsplash.com/photo-1603584173870-7b299f589389?auto=format&fit=crop&w=400&q=80', dotari: ['Senzori', 'Diesel'] },
        { id: 3, marca: 'Mercedes', model: 'C-Class', an: 2022, matriculare: 'B 99 MER', pret: 60, img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80', dotari: ['Piele', 'Trapă'] },
        { id: 4, marca: 'VW', model: 'Golf 8', an: 2021, matriculare: 'IS 05 VWG', pret: 35, img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=400&q=80', dotari: ['CarPlay', 'Manuală'] },
        { id: 5, marca: 'Dacia', model: 'Logan', an: 2023, matriculare: 'B 22 LOG', pret: 25, img: 'https://images.unsplash.com/photo-1621007947382-bb3c39d8e3f9?auto=format&fit=crop&w=400&q=80', dotari: ['AC', 'Bluetooth'] },
        { id: 6, marca: 'Tesla', model: 'Model 3', an: 2022, matriculare: 'IF 33 ELK', pret: 70, img: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=400&q=80', dotari: ['Electric', 'Autopilot'] },
        { id: 7, marca: 'Ford', model: 'Mustang', an: 2019, matriculare: 'B 66 MUS', pret: 85, img: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=400&q=80', dotari: ['Sport', 'V8'] },
        { id: 8, marca: 'Toyota', model: 'Corolla', an: 2021, matriculare: 'CT 12 TOY', pret: 40, img: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=400&q=80', dotari: ['Hibrid', 'Economic'] },
        { id: 9, marca: 'Renault', model: 'Clio', an: 2020, matriculare: 'DJ 99 RNT', pret: 30, img: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=400&q=80', dotari: ['Compact', 'Navi'] },
        { id: 10, marca: 'Skoda', model: 'Octavia', an: 2021, matriculare: 'SB 44 SKD', pret: 42, img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=400&q=80', dotari: ['Portbagaj mare', 'Diesel'] },
        { id: 11, marca: 'Mazda', model: 'CX-5', an: 2022, matriculare: 'BV 88 MAZ', pret: 55, img: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=400&q=80', dotari: ['SUV', '4x4'] },
        { id: 12, marca: 'Volvo', model: 'XC60', an: 2021, matriculare: 'CJ 77 VOL', pret: 65, img: 'https://images.unsplash.com/photo-1605218427360-6961d9196b0c?auto=format&fit=crop&w=400&q=80', dotari: ['Siguranță', 'Premium'] },
        { id: 13, marca: 'Porsche', model: 'Macan', an: 2023, matriculare: 'B 01 POR', pret: 120, img: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=400&q=80', dotari: ['Lux', 'Sport'] },
        { id: 14, marca: 'Fiat', model: '500', an: 2018, matriculare: 'TM 10 FIA', pret: 25, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80', dotari: ['Mică', 'City'] },
    ]);
    const indexOfLastCar = currentPage * carsPerPage;
    const indexOfFirstCar = indexOfLastCar - carsPerPage;
    const currentCars = masini.slice(indexOfFirstCar, indexOfLastCar);
    const totalPages = Math.ceil(masini.length / carsPerPage);

    const changePage = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    const handleInchiriaza = (masina) => {
        alert(`Ai selectat: ${masina.marca} ${masina.model}`);
    };

    return (
        <div className="home-container">
            <nav className="navbar">
                <div 
                    className="profile-section" 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                >
                    <div className="avatar-circle">U</div>
                    <div className="user-info">
                        <span className="user-name">Salut, Utilizator! &#9662;</span>
                    </div>

                    {showProfileMenu && (
                        <div className="profile-dropdown">
                            <div 
                                className="dropdown-item" 
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    navigate('/finalizare-profil');
                                }}
                            >
                                👤 Modifica Profilul
                            </div>
                        </div>
                    )}
                </div>

                <div className="nav-center">
                    <input type="text" placeholder="Caută o mașină..." className="search-bar" />
                </div>
                
                <div className="nav-actions">
                    <button className="logout-btn" onClick={() => navigate('/')}>Deconectare</button>
                </div>
            </nav>

            <main className="main-content">
                <h1>Masini disponibile: (Pagina {currentPage})</h1>
                
                <div className="cars-grid">
                    {currentCars.map((masina) => (
                        <div key={masina.id} className="car-card">
                            <div className="card-image">
                                <img src={masina.img} alt={masina.model} />
                                <span className="price-tag">{masina.pret}€ / zi</span>
                            </div>
                            <div className="card-details">
                                <h3>{masina.marca} {masina.model}</h3>
                                <div className="specs-table">
                                    <div className="spec-row"><span>An:</span> <strong>{masina.an}</strong></div>
                                    <div className="spec-row"><span>Nr:</span> <strong>{masina.matriculare}</strong></div>
                                </div>
                                <div className="features-section">
                                    <div className="features-list">
                                        {masina.dotari.map((dotare, index) => (
                                            <span key={index} className="feature-badge">{dotare}</span>
                                        ))}
                                    </div>
                                </div>
                                <button className="rent-btn" onClick={() => handleInchiriaza(masina)}>Închiriază</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pagination-container">
                    <button 
                        className="page-btn" 
                        onClick={() => changePage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        &laquo; Inapoi
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                        <button 
                            key={i + 1} 
                            className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                            onClick={() => changePage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button 
                        className="page-btn" 
                        onClick={() => changePage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Urmatoarea &raquo;
                    </button>
                </div>

            </main>
        </div>
    );
}

export default Acasa;