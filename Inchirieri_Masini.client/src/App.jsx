import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './Înregistrare'; 
import Logare from './Logare';
import FinalizareProfil from './FinalizareProfil';
import Acasa from './Acasa';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Logare />} />        
        <Route path="/login" element={<Logare />} />        
        <Route path="/register" element={<Register />} />
        <Route path="/finalizare-profil" element ={<FinalizareProfil />} />
        <Route path="/acasa" element ={<Acasa />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;