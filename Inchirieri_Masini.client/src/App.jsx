import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Înregistrare'; 
import Logare from './Logare';
import Acasa from './Acasa';
import DatePersonale from './DatePersonale';
import CarDetails from './CarDetails';
import AdminMasina from './AdminMasina';
import AdminContracte from './AdminContracte';
import ContracteleMele from './ContracteleMele';
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
        <Route path="/adauga-masina" element={<AdminMasina />} />
        <Route path="/modifica-masina/:id" element={<AdminMasina />} />
        <Route path="/admin-contracte" element={<AdminContracte />} />
        <Route path="/contractele-mele" element={<ContracteleMele />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;