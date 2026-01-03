import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FinalizareProfil.css';

function FinalizareProfil() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        telefon: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/Profil/finalizare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(`Profil finalizat pentru: ${formData.nume} ${formData.prenume}`);
                navigate('/acasa');
            } else if (response.status === 401) {
                alert("Sesiune expirată. Te rugăm să te loghezi din nou.");
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                const errorText = await response.text();
                alert("Eroare: " + errorText);
            }
        } catch (error) {
            alert("Nu s-a putut contacta serverul.");
        }
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