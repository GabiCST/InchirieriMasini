import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CarDetails from './CarDetails';
import Register from './Înregistrare';
import Logare from './Logare';
import Acasa from './Acasa';
import DatePersonale from './DatePersonale';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;