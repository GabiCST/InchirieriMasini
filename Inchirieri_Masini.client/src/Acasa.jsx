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

    const isAdmin = localStorage.getItem('isAdmin') === 'true';
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

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Sigur vrei să ștergi această mașină? Acțiunea este ireversibilă!");
        if (!confirmDelete) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/AdminMasini/stergere/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMasini(masini.filter(m => (m.id || m.iD_Autovehicul || m.ID_Autovehicul) !== id));
                alert("Mașina a fost ștearsă.");
            } else {
                alert("Eroare la ștergere. Verifică dacă mașina are contracte active.");
            }
        } catch (error) {
            console.error(error);
            alert("Eroare server.");
        }
    };

    const getValue = (obj, ...keys) => {
        for (let key of keys) {
            if (obj[key] !== undefined && obj[key] !== null) return obj[key];
        }
        return '';
    };

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const masiniFiltrate = masini.filter((masina) => {
        const model = getValue(masina, 'model', 'Model');
        return model.toLowerCase().includes(searchTerm.toLowerCase());
    });

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
    
                    <div className="admin-header-buttons">
                        {!isAdmin && (
                            <button className="view-contracts-btn" onClick={() => navigate('/contractele-mele')}>
                                📂 Contractele mele
                            </button>
                        )}

                        {isAdmin && (
                            <>
                                <button className="view-contracts-btn" onClick={() => navigate('/admin-contracte')}>
                                    📄 Vizualizare Contracte
                                </button>
                                <button className="add-car-btn" onClick={() => navigate('/adauga-masina')}>
                                    + Adaugă Autovehicul
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="cars-grid">
                    {currentCars.map((masina) => {
                        const id = getValue(masina, 'id', 'iD_Autovehicul', 'ID_Autovehicul');
                        const img = getValue(masina, 'img', 'poza', 'Poza');
                        const model = getValue(masina, 'model', 'Model');
                        const pret = getValue(masina, 'pret', 'tarif_Inchiriere', 'Tarif_Inchiriere');
                        const motor = getValue(masina, 'motorizare', 'Motorizare');
                        const an = getValue(masina, 'an', 'anFabricatie', 'AnFabricatie');
                        const nr = getValue(masina, 'numar_Inmatriculare', 'numar_Matricula', 'Numar_Matricula');

                        return (
                            <div key={id} className="car-card">
                                <div className="card-image">
                                    <img src={img || 'https://via.placeholder.com/400x250'} alt={model} />
                                    <span className="price-tag">{pret}€ / zi</span>
                                </div>
                                <div className="card-details">
                                    <h3>{model}</h3>
                                    <div className="specs-table">
                                        <div className="spec-row"><span>Motorizare:</span> <strong>{motor}</strong></div>
                                        <div className="spec-row"><span>An:</span> <strong>{an}</strong></div>
                                        <div className="spec-row"><span>Nr:</span> <strong>{nr}</strong></div>
                                    </div>
                                    
                                    <div className="button-group">
                                        {isAdmin ? (
                                            <div className="admin-actions-grid">
                                                <button className="btn-icon btn-view" title="Vezi Detalii" onClick={() => navigate(`/masina/${id}`)}>👁️</button>
                                                <button className="btn-icon btn-edit" title="Modifică" onClick={() => navigate(`/modifica-masina/${id}`)}>✏️</button>
                                                <button className="btn-icon btn-delete" title="Șterge" onClick={() => handleDelete(id)}>🗑️</button>
                                            </div>
                                        ) : (
                                            <button className="detalii-btn" onClick={() => navigate(`/masina/${id}`)}>
                                                Afișează detalii
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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