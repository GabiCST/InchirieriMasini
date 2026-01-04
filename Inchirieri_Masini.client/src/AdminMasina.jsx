import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminMasina.css';

function AdminMasina() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State pentru formular
    const [formData, setFormData] = useState({
        Model: '',
        Marca: '',
        AnFabricatie: '',
        Motorizare: '',
        Numar_Matricula: '',
        Tarif_Inchiriere: '',
        Poza: '',
        Descriere: ''
    });

    // State separat pentru listele dinamice
    const [dotariList, setDotariList] = useState([]);
    const [conditiiList, setConditiiList] = useState([]);

    // Input-uri temporare pentru adaugare in liste
    const [tempDotare, setTempDotare] = useState('');
    const [tempConditie, setTempConditie] = useState('');

    // 1. Incarcare date (Edit Mode)
    useEffect(() => {
        if (id) {
            setLoading(true);
            const fetchMasina = async () => {
                const token = localStorage.getItem('token');
                try {
                    const response = await fetch(`/api/Masini/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setFormData({
                            Model: data.model || data.Model || '',
                            Marca: data.marca || data.Marca || '', 
                            AnFabricatie: data.anFabricatie || data.AnFabricatie || '',
                            Motorizare: data.motorizare || data.Motorizare || '',
                            Numar_Matricula: data.numar_Matricula || data.Numar_Matricula || '',
                            Tarif_Inchiriere: data.tarif_Inchiriere || data.Tarif_Inchiriere || '',
                            Poza: data.poza || data.Poza || '',
                            Descriere: data.descriere || data.Descriere || ''
                        });
                        
                        // Setam listele daca vin de la backend (sau lasam gol daca nu)
                        setDotariList(data.dotari || []);
                        setConditiiList(data.conditii || []);
                    } else {
                        setError("Nu am putut încărca datele mașinii.");
                    }
                } catch (err) {
                    setError("Eroare de conexiune.");
                } finally {
                    setLoading(false);
                }
            };
            fetchMasina();
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- FUNCTII PENTRU DOTARI ---
    const addDotare = () => {
        if (tempDotare.trim()) {
            setDotariList([...dotariList, tempDotare.trim()]);
            setTempDotare('');
        }
    };

    const removeDotare = (index) => {
        const newList = dotariList.filter((_, i) => i !== index);
        setDotariList(newList);
    };

    // --- FUNCTII PENTRU CONDITII ---
    const addConditie = () => {
        if (tempConditie.trim()) {
            setConditiiList([...conditiiList, tempConditie.trim()]);
            setTempConditie('');
        }
    };

    const removeConditie = (index) => {
        const newList = conditiiList.filter((_, i) => i !== index);
        setConditiiList(newList);
    };

    // 3. Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        setLoading(true);

        const url = id ? `/api/Masini/${id}` : '/api/Masini';
        const method = id ? 'PUT' : 'POST'; 

        const payload = {
            ...formData,
            AnFabricatie: parseInt(formData.AnFabricatie),
            Tarif_Inchiriere: parseFloat(formData.Tarif_Inchiriere),
            ID_Autovehicul: id ? parseInt(id) : undefined,
            // Trimitem listele ca array-uri de string-uri
            Dotari: dotariList,
            Conditii: conditiiList
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(id ? "Datele au fost actualizate!" : "Mașina a fost adăugată cu succes!");
                navigate('/acasa');
            } else {
                const errData = await response.json().catch(() => ({}));
                alert(`Eroare: ${errData.message || "Operația a eșuat."}`);
            }
        } catch (err) {
            console.error(err);
            alert("Eroare la server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-card">
                <div className="admin-header">
                    <h2>{id ? '✏️ Modifică Autovehicul' : '➕ Adaugă Autovehicul'}</h2>
                    <p>Completează detaliile tehnice, dotările și condițiile.</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="admin-form">
                    
                    {/* SECTIUNEA 1: Date Generale */}
                    <h3 className="form-section-title">Date Generale & Tehnice</h3>
                    <div className="form-grid">
                        <label>
                            Model Masina
                            <input type="text" name="Model" value={formData.Model} onChange={handleChange} placeholder="ex: VW Arteon" required />
                        </label>
                        <label>
                            Număr Înmatriculare
                            <input type="text" name="Numar_Matricula" value={formData.Numar_Matricula} onChange={handleChange} placeholder="ex: B 99 XYZ" required />
                        </label>
                    </div>

                    <div className="form-grid three-cols">
                        <label>
                            An Fabricație
                            <input type="number" name="AnFabricatie" value={formData.AnFabricatie} onChange={handleChange} placeholder="2024" required />
                        </label>
                        <label>
                            Motorizare
                            <input type="text" name="Motorizare" value={formData.Motorizare} onChange={handleChange} placeholder="ex: 2.0 TDI" required />
                        </label>
                        <label>
                            Preț / Zi (€)
                            <input type="number" name="Tarif_Inchiriere" value={formData.Tarif_Inchiriere} onChange={handleChange} placeholder="90" required />
                        </label>
                    </div>

                    {/* SECTIUNEA 2: Imagine */}
                    <h3 className="form-section-title">Media</h3>
                    <label>
                        Link Poză (URL)
                        <input type="text" name="Poza" value={formData.Poza} onChange={handleChange} placeholder="https://..." />
                    </label>
                    {formData.Poza && (
                        <div className="img-preview">
                            <img src={formData.Poza} alt="Preview" onError={(e) => e.target.style.display='none'} />
                        </div>
                    )}

                    {/* SECTIUNEA 3: DOTĂRI (NOU) */}
                    <h3 className="form-section-title">✨ Dotări și Facilități</h3>
                    <div className="list-manager">
                        <div className="input-group-row">
                            <input 
                                type="text" 
                                placeholder="Adaugă o dotare (ex: Trapă, GPS...)" 
                                value={tempDotare}
                                onChange={(e) => setTempDotare(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDotare())}
                            />
                            <button type="button" className="btn-add-item" onClick={addDotare}>+</button>
                        </div>
                        
                        <div className="tags-container">
                            {dotariList.map((item, index) => (
                                <span key={index} className="tag-item">
                                    ✓ {item}
                                    <button type="button" className="btn-remove-tag" onClick={() => removeDotare(index)}>×</button>
                                </span>
                            ))}
                            {dotariList.length === 0 && <span className="empty-tag-msg">Nicio dotare adăugată.</span>}
                        </div>
                    </div>

                    {/* SECTIUNEA 4: CONDIȚII (NOU) */}
                    <h3 className="form-section-title">📋 Condiții de Închiriere</h3>
                    <div className="list-manager">
                        <div className="input-group-row">
                            <input 
                                type="text" 
                                placeholder="Adaugă o condiție (ex: Fumatul interzis...)" 
                                value={tempConditie}
                                onChange={(e) => setTempConditie(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addConditie())}
                            />
                            <button type="button" className="btn-add-item" onClick={addConditie}>+</button>
                        </div>
                        
                        <div className="tags-container conditions-style">
                            {conditiiList.map((item, index) => (
                                <span key={index} className="tag-item condition">
                                    • {item}
                                    <button type="button" className="btn-remove-tag" onClick={() => removeConditie(index)}>×</button>
                                </span>
                            ))}
                            {conditiiList.length === 0 && <span className="empty-tag-msg">Nicio condiție adăugată.</span>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/acasa')}>
                            Anulează
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Se procesează...' : (id ? '💾 Salvează' : '➕ Adaugă Mașina')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminMasina;