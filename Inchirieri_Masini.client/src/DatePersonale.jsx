import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ÎnregistrareLogare.css';

function DatePersonale() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        numarTelefon: '',
        ci: '',
        adresa: '',
        serieCarnet: '',
        dataExpirare: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const endpoint = isAdmin ? '/api/ProfilAdmin/detalii' : '/api/ProfilUser/detalii';

            try {
                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    setFormData({
                        nume: data.nume || '',
                        prenume: data.prenume || '',
                        numarTelefon: data.telefon || '',
                        ci: data.ci || '',
                        adresa: data.adresa || '',
                        serieCarnet: data.serie_carnet || '',
                        dataExpirare: data.data_expirare || ''
                    });
                }
            } catch (error) {
                console.error("Eroare la incarcare", error);
                setMessage("Eroare la încărcarea datelor.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate, isAdmin]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const endpoint = isAdmin ? '/api/ProfilAdmin/salveaza' : '/api/ProfilUser/salveaza';

            const payload = isAdmin 
                ? {
                    nume: formData.nume,
                    prenume: formData.prenume,
                    telefon: formData.numarTelefon
                }
                : {
                    nume: formData.nume,
                    prenume: formData.prenume,
                    telefon: formData.numarTelefon,
                    ci: formData.ci,
                    adresa: formData.adresa,
                    serie_carnet: formData.serieCarnet,
                    data_expirare: formData.dataExpirare || null
                };

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    setMessage("Datele au fost salvate cu succes!");
                    setTimeout(() => navigate('/acasa'), 2000); 
                } else {
                    const error = await response.json();
                    setMessage(response.status === 403 ? "Eroare: Nu aveți drepturi de admin." : "Eroare la salvare.");
                }
            } catch (error) {
                setMessage("Eroare de conexiune la server.");
            }
        };

    if (loading) return <div className="register-container"><p>Se încarcă...</p></div>;

    return (
        <div className="register-container">
            <form className="register-form wide-form" onSubmit={handleSubmit}>
                <div className="form-header">
                    <h2>{isAdmin ? 'Date Contact Admin' : 'Profilul Tău'}</h2>
                    <p>{isAdmin ? 'Actualizează datele de contact publice.' : 'Completează datele pentru a putea închiria rapid.'}</p>
                </div>

                {message && (
                    <div className={`status-message ${message.includes('Eroare') || message.includes('conexiune') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <h3 className="section-title">Informații Contact</h3>
                
                <div className="form-row">
                    <label>
                        Nume
                        <input type="text" name="nume" value={formData.nume} onChange={handleChange} required />
                    </label>
                    <label>
                        Prenume
                        <input type="text" name="prenume" value={formData.prenume} onChange={handleChange} required />
                    </label>
                </div>

                <label style={{marginTop: '15px'}}>
                    Număr Telefon
                    <input type="tel" name="numarTelefon" value={formData.numarTelefon} onChange={handleChange} placeholder="07xx xxx xxx" required />
                </label>

                {!isAdmin && (
                    <>
                        <h3 className="section-title">Identitate & Adresă</h3>
                        <div className="form-row">
                            <label>
                                Serie & Nr. Buletin (CI)
                                <input type="text" name="ci" value={formData.ci} onChange={handleChange} required />
                            </label>
                            <div></div>
                        </div>
                        
                        <label>
                            Adresa Completă
                            <input type="text" name="adresa" className="full-width" value={formData.adresa} onChange={handleChange} required />
                        </label>

                        <h3 className="section-title">Permis de Conducere</h3>
                        <div className="form-row">
                            <label>
                                Serie Carnet
                                <input type="text" name="serieCarnet" value={formData.serieCarnet} onChange={handleChange} required />
                            </label>

                            <label>
                                Data Expirare
                                <input 
                                    type="date" 
                                    name="dataExpirare" 
                                    value={formData.dataExpirare} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </label>
                        </div>
                    </>
                )}

                <div className="button-group">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/acasa')}>
                        Renunță
                    </button>
                    <button type="submit" className="btn-primary">
                        Salvează
                    </button>
                </div>
            </form>
        </div>
    );
}

export default DatePersonale;