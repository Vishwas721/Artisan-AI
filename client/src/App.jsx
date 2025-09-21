import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddCraftPage from './pages/AddCraftPage';
import ProductPage from './pages/ProductPage';
import VerificationPage from './pages/VerificationPage'; // New import
import './App.css';
import BrandProfilePage from './pages/BrandProfilePage';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AddCraftPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/verify/:certId?" element={<VerificationPage />} /> {/* New Route */}
          <Route path="/profile" element={<BrandProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;