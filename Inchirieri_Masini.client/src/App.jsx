import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importurile tale existente
import Register from './Înregistrare'; 
import Logare from './Logare';
import Acasa from './Acasa';
import DatePersonale from './DatePersonale';
import CarDetails from './CarDetails';

// --- IMPORT NOU PENTRU ADMIN ---
// (Va trebui să creăm acest fișier imediat ca să nu dea eroare)
import AdminMasina from './AdminMasina'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<Logare />} />
        <Route path="/register" element={<Register />} />
        <Route path="/date-personale" element={<DatePersonale />} />
        <Route path="/acasa" element={<Acasa />} />
        <Route path="/masina/:id" element={<CarDetails />} />

        {/* --- RUTE NOI DE ADMIN --- */}
        {/* Ruta pentru Adaugare (fara ID) */}
        <Route path="/adauga-masina" element={<AdminMasina />} />
        
        {/* Ruta pentru Modificare (cu ID) */}
        <Route path="/modifica-masina/:id" element={<AdminMasina />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;