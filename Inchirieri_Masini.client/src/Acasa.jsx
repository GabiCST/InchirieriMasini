import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Acasa.css';

function Acasa() {
    const navigate = useNavigate();
    
    // State-uri (păstrate din versiunea ta funcțională)
    const [masini, setMasini] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('Utilizator');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMenu, setShowMenu] = useState(false);

    // Verificare Rol Admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const carsPerPage = 6;

    // useEffect încărcare date
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

    // --- FUNCTIA NOUĂ: ȘTERGERE ---
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Sigur vrei să ștergi această mașină? Acțiunea este ireversibilă!");
        if (!confirmDelete) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/Masini/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Actualizăm lista locală scoțând mașina ștearsă (folosim masina.id conform codului tău)
                setMasini(masini.filter(m => m.id !== id));
                alert("Mașina a fost ștearsă.");
            } else {
                alert("Eroare la ștergere. Verifică dacă mașina are contracte active.");
            }
        } catch (error) {
            console.error(error);
            alert("Eroare server.");
        }
    };

    // Filtrare & Paginare (Neschimbate)
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const masiniFiltrate = masini.filter((masina) =>
        masina.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastCar = currentPage * carsPerPage;
    const indexOfFirstCar = indexOfLastCar - carsPerPage;
    const currentCars = masiniFiltrate.slice(indexOfFirstCar, indexOfLastCar);
    const totalPages = Math.ceil(masiniFiltrate.length / carsPerPage);

    const changePage = (pageNumber) => { setCurrentPage(pageNumber); window.scrollTo(0, 0); };
    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    if (loading) return <div className="loading-container">Se încarcă mașinile...</div>;

    return (
        <div className="home-container">
            <nav className="navbar">
                <div className="profile-section user-profile-container" onClick={() => setShowMenu(!showMenu)}>
                    <div className="avatar-circle">{isAdmin ? 'A' : username.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                        <span className="user-name">{isAdmin ? 'Admin Panel' : `Salut, ${username}!`} ▼</span>
                    </div>

                    {showMenu && (
                        <div className="dropdown-menu">
                            <Link to="/date-personale" className="dropdown-item">
                                {isAdmin ? '📞 Informații Contact' : '🖊 Completează date personale'}
                            </Link>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-item logout-text" onClick={handleLogout}>Deconectare</div>
                        </div>
                    )}
                </div>

                <div className="nav-center">
                    <input type="text" placeholder="Caută după model..." className="search-bar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>
            </nav>

            <main className="main-content">
                <div className="header-actions">
                    <h1>{isAdmin ? 'Administrare Flotă' : 'Mașini disponibile'}</h1>
                    {isAdmin && (
                        <button className="add-car-btn" onClick={() => navigate('/adauga-masina')}>
                            + Adaugă Autovehicul
                        </button>
                    )}
                </div>

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
                                    {isAdmin ? (
                                        // --- AICI AM MODIFICAT: 3 Butoane pentru Admin ---
                                        <div className="admin-actions-grid">
                                            {/* 1. Buton Vizualizare (Ochi) */}
                                            <button className="btn-icon btn-view" title="Vezi cum arată pagina" onClick={() => navigate(`/masina/${masina.id}`)}>
                                                👁️
                                            </button>
                                            
                                            {/* 2. Buton Modificare (Creion) */}
                                            <button className="btn-icon btn-edit" title="Modifică datele" onClick={() => navigate(`/modifica-masina/${masina.id}`)}>
                                                ✏️
                                            </button>

                                            {/* 3. Buton Ștergere (Gunoi) */}
                                            <button className="btn-icon btn-delete" title="Șterge mașina" onClick={() => handleDelete(masina.id)}>
                                                🗑️
                                            </button>
                                        </div>
                                    ) : (
                                        // --- Buton standard pentru User ---
                                        <button className="detalii-btn" onClick={() => navigate(`/masina/${masina.id}`)}>
                                            Afișează detalii
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {masiniFiltrate.length === 0 && (
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>Nu am găsit nicio mașină.</p>
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