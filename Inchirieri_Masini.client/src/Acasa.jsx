import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Acasa.css';

function Acasa() {
    const navigate = useNavigate();
    const [masini, setMasini] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('Utilizator');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [showMenu, setShowMenu] = useState(false);

    const carsPerPage = 6;

    useEffect(() => {
        const incarcaDate = async () => {
            const token = localStorage.getItem('token');
            const storedUsername = localStorage.getItem('username');
            
            if (!token) {
                navigate('/login');
                return;
            }

            if (storedUsername) setUsername(storedUsername);

            try {
                const response = await fetch('/api/Masini', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setMasini(data);
                } else if (response.status === 401) {
                    navigate('/login');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        incarcaDate();
    }, [navigate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const masiniFiltrate = masini.filter((masina) =>
        masina.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastCar = currentPage * carsPerPage;
    const indexOfFirstCar = indexOfLastCar - carsPerPage;
    const currentCars = masiniFiltrate.slice(indexOfFirstCar, indexOfLastCar);
    const totalPages = Math.ceil(masiniFiltrate.length / carsPerPage);

    const changePage = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) return <div className="loading-container">Se încarcă mașinile...</div>;

    return (
        <div className="home-container">
            <nav className="navbar">
                
                <div 
                    className="profile-section user-profile-container" 
                    onClick={() => setShowMenu(!showMenu)}
                >
                    <div className="avatar-circle">{username.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                        <span className="user-name">Salut, {username}! ▼</span>
                    </div>

                    {showMenu && (
                        <div className="dropdown-menu">
                          
                            <Link to="/date-personale" className="dropdown-item">
                                🖊 Completează date personale
                            </Link>
                            
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-item logout-text" onClick={handleLogout}>
                                Deconectare
                            </div>
                        </div>
                    )}
                </div>

                <div className="nav-center">
                    <input 
                        type="text" 
                        placeholder="Caută după model (ex: Logan, BMW...)" 
                        className="search-bar" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </nav>

            <main className="main-content">
                <h1>Mașini disponibile</h1>
                <div className="cars-grid">
                    {currentCars.map((masina) => (
                        <div key={masina.id} className="car-card">
                            <div className="card-image">
                                <img src={masina.img || 'https://via.placeholder.com/400x250'} alt={masina.model} />
                                <span className="price-tag">{masina.pret}€ / zi</span>
                            </div>
                            <div className="card-details">
                                <h3>{masina.model}</h3>
                                <div className="specs-table">
                                    <div className="spec-row"><span>Motorizare:</span> <strong>{masina.motorizare}</strong></div>
                                    <div className="spec-row"><span>An:</span> <strong>{masina.an}</strong></div>
                                    <div className="spec-row"><span>Nr:</span> <strong>{masina.numar_Inmatriculare}</strong></div>
                                </div>
                                
                                <div className="button-group">
                                    <button 
                                        className="detalii-btn" 
                                        onClick={() => navigate(`/masina/${masina.id}`)}
                                    >
                                        Afiseaza detalii
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {masiniFiltrate.length === 0 && (
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>Nu am găsit nicio mașină care să corespundă căutării.</p>
                )}

                {totalPages > 1 && (
                    <div className="pagination-container">
                        <button className="page-btn" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>&laquo; Inapoi</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i + 1} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => changePage(i + 1)}>{i + 1}</button>
                        ))}
                        <button className="page-btn" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>Urmatoarea &raquo;</button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Acasa;