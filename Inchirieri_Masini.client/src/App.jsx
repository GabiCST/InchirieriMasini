import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CarDetails from './CarDetails';
import Register from './Înregistrare'; // sau './Register' daca l-ai redenumit
import Logare from './Logare';
import Acasa from './Acasa';
import DatePersonale from './DatePersonale'; // <--- 1. ASIGURA-TE CA AI LINIA ASTA

// Daca ai si pagina de detalii masina, import-o si pe ea:
// import CarDetails from './CarDetails'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirecționare automată de la "/" la login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<Logare />} />
        <Route path="/register" element={<Register />} />
        
        {/* <--- 2. AICI ESTE LINIA CARE LIPSEȘTE */}
        <Route path="/date-personale" element={<DatePersonale />} />
        
        <Route path="/acasa" element={<Acasa />} />
        <Route path="/masina/:id" element={<CarDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;