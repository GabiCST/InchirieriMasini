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

    const [existingEvents, setExistingEvents] = useState([]);
    const [isAddingEveniment, setIsAddingEveniment] = useState(false);
    const [isEditingEveniment, setIsEditingEveniment] = useState(false);
    const [evenimentData, setEvenimentData] = useState({
        iD_Eveniment: null,
        nume_Eveniment: '',
        tip: '',
        data_Eveniment: '',
        locatie: '',
        descriere: '',
        costul_Reparatiei: ''
    });

    const fetchMasina = async () => {
        const token = localStorage.getItem('token');
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
            setExistingEvents(data.evenimente || []);
        }
    };

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
                await fetchMasina();
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const openEditEveniment = (ev) => {
        setEvenimentData({
            iD_Eveniment: ev.iD_Eveniment,
            nume_Eveniment: ev.nume_Eveniment,
            tip: ev.tip,
            data_Eveniment: ev.data_Eveniment.split('T')[0],
            locatie: ev.locatie,
            descriere: ev.descriere,
            costul_Reparatiei: ev.costul_Reparatiei
        });
        setIsEditingEveniment(true);
        setIsAddingEveniment(true);
    };

    const resetEvenimentForm = () => {
        setIsAddingEveniment(false);
        setIsEditingEveniment(false);
        setEvenimentData({ iD_Eveniment: null, nume_Eveniment: '', tip: '', data_Eveniment: '', locatie: '', descriere: '', costul_Reparatiei: 0 });
    };

    const handleSaveEveniment = async () => {
        const token = localStorage.getItem('token');
        const method = isEditingEveniment ? 'PUT' : 'POST';
        const url = isEditingEveniment 
            ? `/api/AdminMasini/modifica-eveniment/${evenimentData.iD_Eveniment}` 
            : '/api/AdminMasini/adaugare-eveniment';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ...evenimentData, id_autovehicul: parseInt(id) })
        });

        if (res.ok) {
            alert(isEditingEveniment ? "Eveniment actualizat!" : "Eveniment adăugat!");
            resetEvenimentForm();
            await fetchMasina();
        } else alert("Eroare la procesarea evenimentului.");
    };

    const handleDeleteEveniment = async () => {
        if (!window.confirm("Sigur ștergi acest eveniment?")) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/AdminMasini/sterge-eveniment/${evenimentData.iD_Eveniment}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            alert("Eveniment șters!");
            resetEvenimentForm();
            await fetchMasina();
        } else alert("Eroare la ștergere.");
    };

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
                            <select autoFocus className="inline-select" onChange={(e) => handleAdd(e.target.value, selectedDotari, setSelectedDotari, setIsAddingDotare)} onBlur={() => setIsAddingDotare(false)}>
                                <option value="">Alege...</option>
                                {allDotari.filter(d => !selectedDotari.includes(d.id.toString())).map(d => <option key={d.id} value={d.id}>{d.nume}</option>)}
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
                            <select autoFocus className="inline-select" onChange={(e) => handleAdd(e.target.value, selectedConditii, setSelectedConditii, setIsAddingConditie)} onBlur={() => setIsAddingConditie(false)}>
                                <option value="">Alege...</option>
                                {allConditii.filter(c => !selectedConditii.includes(c.id.toString())).map(c => <option key={c.id} value={c.id}>{c.nume}</option>)}
                            </select>
                        ) : (
                            <button type="button" className="btn-inline-add" onClick={() => setIsAddingConditie(true)}>+</button>
                        )}
                    </div>

                    {id && (
                        <>
                            <h3 className="form-section-title">⚠️ Istoric Evenimente Rutiere</h3>
                            <div className="tags-container events-style">
                                {existingEvents.map((ev, idx) => (
                                    <div key={idx} className="tag-item" style={{ cursor: 'pointer' }} onClick={() => openEditEveniment(ev)}>
                                        {ev.nume_Eveniment}
                                    </div>
                                ))}
                                <button type="button" className="btn-inline-add" onClick={() => setIsAddingEveniment(true)}>+</button>
                            </div>
                            
                            {isAddingEveniment && (
                                <div className="event-form-overlay">
                                    <div className="event-form-card">
                                        <h4>{isEditingEveniment ? 'Modifică Eveniment' : 'Detalii Eveniment Nou'}</h4>
                                        <label>Nume Eveniment
                                            <input type="text" value={evenimentData.nume_Eveniment} onChange={e => setEvenimentData({...evenimentData, nume_Eveniment: e.target.value})} required />
                                        </label>
                                        <div className="form-grid">
                                            <label>Tip
                                                <input type="text" value={evenimentData.tip} onChange={e => setEvenimentData({...evenimentData, tip: e.target.value})} />
                                            </label>
                                            <label>Data
                                                <input type="date" value={evenimentData.data_Eveniment} onChange={e => setEvenimentData({...evenimentData, data_Eveniment: e.target.value})} />
                                            </label>
                                        </div>
                                        <label>Locație
                                            <input type="text" value={evenimentData.locatie} onChange={e => setEvenimentData({...evenimentData, locatie: e.target.value})} />
                                        </label>
                                        <label>Descriere
                                            <textarea value={evenimentData.descriere} onChange={e => setEvenimentData({...evenimentData, descriere: e.target.value})} />
                                        </label>
                                        <label>Cost (Euro)
                                            <input type="number" value={evenimentData.costul_Reparatiei} onChange={e => setEvenimentData({...evenimentData, costul_Reparatiei: parseInt(e.target.value)})} />
                                        </label>
                                        <div className="event-form-actions">
                                            {isEditingEveniment && <button type="button" className="btn-cancel" style={{ background: '#dc3545', color: 'white' }} onClick={handleDeleteEveniment}>Șterge</button>}
                                            <button type="button" onClick={resetEvenimentForm}>Anulează</button>
                                            <button type="button" className="btn-save-event" onClick={handleSaveEveniment}>{isEditingEveniment ? 'Actualizează' : 'Salvează'}</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/acasa')}>Anulează</button>
                        <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Salvare...' : 'Salvează Autovehicul'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminMasina;