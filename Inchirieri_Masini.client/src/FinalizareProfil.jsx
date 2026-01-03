import { useState } from 'react';
import './FinalizareProfil.css';
function FinalizareProfil() {
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        telefon: ''
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    const handleSubmit = (e) => {
        e.preventDefault(); 
        console.log("Date colectate:", formData);        
        alert(`Profil finalizat pentru: ${formData.nume} ${formData.prenume}`);
    };

    return (
        <div className="profil-container">
            <div className="card">
                <h2>Finalizarea profilului</h2>                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nume">Nume:</label>
                        <input
                            type="text"
                            id="nume"
                            name="nume"
                            value={formData.nume} 
                            onChange={handleChange} 
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="prenume">Prenume:</label>
                        <input
                            type="text"
                            id="prenume"
                            name="prenume"
                            value={formData.prenume}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefon">Număr de telefon:</label>
                        <input
                            type="tel"
                            id="telefon"
                            name="telefon"
                            value={formData.telefon}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-submit">Salvează și Continuă</button>
                </form>
            </div>
        </div>
    );
}

export default FinalizareProfil;