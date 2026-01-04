import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminMasina.css';

function AdminMasina() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        model: '', numar_Inmatriculare: '', an: '', motorizare: '', pret: '', img: '', descriere: ''
    });

    const [allDotari, setAllDotari] = useState([]);
    const [allConditii, setAllConditii] = useState([]);
    const [selectedDotari, setSelectedDotari] = useState([]);
    const [selectedConditii, setSelectedConditii] = useState([]);

    const [isAddingDotare, setIsAddingDotare] = useState(false);
    const [isAddingConditie, setIsAddingConditie] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchData = async () => {
            const [resD, resC] = await Promise.all([
                fetch('/api/AdminMasini/dotari-toate', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/AdminMasini/conditii-toate', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (resD.ok) setAllDotari(await resD.json());
            if (resC.ok) setAllConditii(await resC.json());

            if (id) {
                setLoading(true);
                const resM = await fetch(`/api/AdminMasini/preluare/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (resM.ok) {
                    const data = await resM.json();
                    setFormData({
                        model: data.model, numar_Inmatriculare: data.numar_Inmatriculare,
                        an: data.an, motorizare: data.motorizare, pret: data.pret,
                        img: data.img, descriere: data.descriere
                    });
                    setSelectedDotari(data.dotari.map(d => d.toString()));
                    setSelectedConditii(data.conditii.map(c => c.toString()));
                }
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAdd = (val, list, setList, setIsAdding) => {
        if (val) {
            setList([...list, val.toString()]);
            setIsAdding(false);
        }
    };

    const removeItem = (list, setList, val) => {
        setList(list.filter(i => i !== val.toString()));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        const url = id ? `/api/AdminMasini/modificare/${id}` : '/api/AdminMasini/adaugare';
        
        const res = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ...formData, dotari: selectedDotari, conditii: selectedConditii })
        });

        if (res.ok) {
            alert("Salvat cu succes!");
            navigate('/acasa');
        } else alert("Eroare la salvare.");
        setLoading(false);
    };

    return (
        <div className="admin-container">
            <div className="admin-card">
                <div className="admin-header">
                    <h2>{id ? '✏️ Modifică Autovehicul' : '➕ Adaugă Autovehicul'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    <h3 className="form-section-title">Informații Generale</h3>
                    <div className="form-grid">
                        <label>Model 
                            <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
                        </label>
                        <label>Nr. Înmatriculare 
                            <input type="text" value={formData.numar_Inmatriculare} onChange={e => setFormData({...formData, numar_Inmatriculare: e.target.value})} required />
                        </label>
                    </div>

                    <div className="form-grid three-cols">
                        <label>An 
                            <input type="number" value={formData.an} onChange={e => setFormData({...formData, an: e.target.value})} required />
                        </label>
                        <label>Motor 
                            <input type="text" value={formData.motorizare} onChange={e => setFormData({...formData, motorizare: e.target.value})} required />
                        </label>
                        <label>Preț Zi (Euro) 
                            <input type="number" value={formData.pret} onChange={e => setFormData({...formData, pret: e.target.value})} required />
                        </label>
                    </div>

                    <label>Imagine (URL) 
                        <input type="text" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} />
                    </label>
                    <label>Descriere 
                        <textarea rows="3" value={formData.descriere} onChange={e => setFormData({...formData, descriere: e.target.value})} />
                    </label>

                    <h3 className="form-section-title">✨ Dotări</h3>
                    <div className="tags-container">
                        {selectedDotari.map(id => {
                            const dObj = allDotari.find(d => d.id.toString() === id);
                            return (
                                <div key={id} className="tag-item">
                                    {dObj?.nume}
                                    <button type="button" className="btn-remove-tag" onClick={() => removeItem(selectedDotari, setSelectedDotari, id)}>×</button>
                                </div>
                            );
                        })}
                        
                        {isAddingDotare ? (
                            <select 
                                autoFocus
                                className="inline-select"
                                onChange={(e) => handleAdd(e.target.value, selectedDotari, setSelectedDotari, setIsAddingDotare)}
                                onBlur={() => setIsAddingDotare(false)}
                            >
                                <option value="">Alege...</option>
                                {allDotari
                                    .filter(d => !selectedDotari.includes(d.id.toString()))
                                    .map(d => <option key={d.id} value={d.id}>{d.nume}</option>)
                                }
                            </select>
                        ) : (
                            <button type="button" className="btn-inline-add" onClick={() => setIsAddingDotare(true)}>+</button>
                        )}
                    </div>

                    <h3 className="form-section-title">📋 Condiții</h3>
                    <div className="tags-container conditions-style">
                        {selectedConditii.map(id => {
                            const cObj = allConditii.find(c => c.id.toString() === id);
                            return (
                                <div key={id} className="tag-item">
                                    {cObj?.nume}
                                    <button type="button" className="btn-remove-tag" onClick={() => removeItem(selectedConditii, setSelectedConditii, id)}>×</button>
                                </div>
                            );
                        })}

                        {isAddingConditie ? (
                            <select 
                                autoFocus
                                className="inline-select"
                                onChange={(e) => handleAdd(e.target.value, selectedConditii, setSelectedConditii, setIsAddingConditie)}
                                onBlur={() => setIsAddingConditie(false)}
                            >
                                <option value="">Alege...</option>
                                {allConditii
                                    .filter(c => !selectedConditii.includes(c.id.toString()))
                                    .map(c => <option key={c.id} value={c.id}>{c.nume}</option>)
                                }
                            </select>
                        ) : (
                            <button type="button" className="btn-inline-add" onClick={() => setIsAddingConditie(true)}>+</button>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/acasa')}>Anulează</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Salvare...' : 'Salvează'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminMasina;