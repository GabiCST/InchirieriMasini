import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './Înregistrare'; 
import Logare from './Logare';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Logare />} />        
        <Route path="/login" element={<Logare />} />        
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;