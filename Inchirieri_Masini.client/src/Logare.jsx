import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ÎnregistrareLogare.css';

function Logare() {
    const [identificator, setIdentificator] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const loginData = {
            identificator: identificator, 
            password: password 
        };

        try {
            const response = await fetch('/api/Logare/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const data = await response.json();
                alert("Logare reușită! Bine ai venit, " + data.utilizator);
            } else {
                const errorText = await response.text();
                alert("Eroare la logare: " + errorText);
            }
        } catch (error) {
            alert("Nu s-a putut contacta serverul.");
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <label>
                    Username sau Email:
                    <input 
                        type="text" 
                        value={identificator} 
                        onChange={(e) => setIdentificator(e.target.value)} 
                        required 
                    />
                </label>
                <label>
                    Parola:
                    <div className="password-input-wrapper">
                        <input 
                            type={passwordVisible ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                        <span className="password-toggle-icon" onClick={togglePasswordVisibility} style={{cursor: 'pointer'}}>
                            {passwordVisible ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </span>
                    </div>
                </label>
                
                <button type="submit">Logare</button>
                
                <p style={{textAlign: 'center', marginTop: '15px'}}>
                    Nu ai cont? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Inregistreaza-te aici.</Link>      
                </p>
            </form>
        </div>
    );
}

export default Logare;