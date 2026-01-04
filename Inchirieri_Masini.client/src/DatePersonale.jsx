import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ÎnregistrareLogare.css';

function DatePersonale() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Aici am spart 'numePrenume' in doua campuri separate: 'nume' si 'prenume'
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

            try {
                const response = await fetch('/api/User/GetDetalii', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // LOGICA DE DESPĂRȚIRE A NUMELUI
                    // Daca vine "Popescu Ion", punem "Popescu" la nume si "Ion" la prenume
                    const numeComplet = data.nume_Prenume || '';
                    const partiNume = numeComplet.split(' '); // Spargem textul la spatiu
                    
                    const numeExtras = partiNume[0] || ''; 
                    const prenumeExtras = partiNume.slice(1).join(' ') || ''; // Restul e prenume

                    setFormData({
                        nume: numeExtras,
                        prenume: prenumeExtras,
                        numarTelefon: data.numarTelefon || '',
                        ci: data.ci || '',
                        adresa: data.adresa || '',
                        serieCarnet: data.serie_Carnet || '',
                        dataExpirare: data.data_expirare ? new Date(data.data_expirare).toISOString().split('T')[0] : ''
                    });
                }
            } catch (error) {
                console.error("Eroare la incarcare", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // LOGICA DE UNIRE (CONCATENARE)
        // Trimitem la server un singur camp "numePrenume" format din cele doua casute
        const dateDeTrimis = {
            ...formData,
            numePrenume: `${formData.nume} ${formData.prenume}`.trim() 
        };

        try {
            const response = await fetch('/api/User/UpdateDetalii', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dateDeTrimis)
            });

            if (response.ok) {
                setMessage("Datele au fost salvate cu succes!");
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage("Eroare la salvare. Verifică datele.");
            }
        } catch (error) {
            setMessage("Eroare de conexiune.");
        }
    };

    if (loading) return <div className="loading-screen">Se încarcă datele...</div>;

    return (
        <div className="register-container">
            <form className="register-form wide-form" onSubmit={handleSubmit}>
                <div className="form-header">
                    <h2>Profilul Tău</h2>
                    <p>Completează datele pentru a putea închiria rapid.</p>
                </div>

                {message && <div className={`status-message ${message.includes('Eroare') ? 'error' : 'success'}`}>
                    {message}
                </div>}

                {/* SECȚIUNEA 1: DATE CONTACT */}
                <h3 className="section-title">Informații Contact</h3>
                
                {/* Aici am pus Nume si Prenume pe acelasi rand (grid) */}
                <div className="form-row">
                    <label>
                        Nume de Familie
                        <input 
                            type="text" 
                            name="nume" 
                            value={formData.nume} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>

                    <label>
                        Prenume
                        <input 
                            type="text" 
                            name="prenume" 
                            value={formData.prenume} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>
                </div>

                {/* Telefonul separat pe un rand nou sau il poti lasa singur */}
                <label style={{marginTop: '10px'}}>
                    Număr Telefon
                    <input 
                        type="tel" 
                        name="numarTelefon" 
                        value={formData.numarTelefon} 
                        onChange={handleChange} 
                        required 
                    />
                </label>

                {/* SECȚIUNEA 2: IDENTITATE */}
                <h3 className="section-title">Identitate & Adresă</h3>
                <div className="form-row">
                    <label>
                        Serie & Nr. Buletin (CI)
                        <input 
                            type="text" 
                            name="ci" 
                            value={formData.ci} 
                            onChange={handleChange} 
                            required 
                        />
                    </label>
                    {/* Am lasat un spatiu gol in dreapta daca vrei, sau poti muta telefonul aici */}
                    <div></div> 
                </div>
                
                <label>
                    Adresa Completă (din Buletin)
                    <input 
                        type="text" 
                        name="adresa" 
                        className="full-width"
                        value={formData.adresa} 
                        onChange={handleChange} 
                        required 
                    />
                </label>

                {/* SECȚIUNEA 3: PERMIS */}
                <h3 className="section-title">Permis de Conducere</h3>
                <div className="form-row">
                    <label>
                        Serie Carnet
                        <input 
                            type="text" 
                            name="serieCarnet" 
                            value={formData.serieCarnet} 
                            onChange={handleChange} 
                            required 
                        />
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

                <div className="button-group">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/acasa')}>
                        Renunță
                    </button>
                    <button type="submit" className="btn-primary">
                        Salvează Datele
                    </button>
                </div>
            </form>
        </div>
    );
}

export default DatePersonale;