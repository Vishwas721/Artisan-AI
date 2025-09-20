import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddCraftPage from './pages/AddCraftPage';
import ProductPage from './pages/ProductPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AddCraftPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;