import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddCraftPage from './pages/AddCraftPage';
import ProductPage from './pages/ProductPage';
import VerificationPage from './pages/VerificationPage';
import ShowcasePage from './pages/ShowcasePage';
import BrandProfilePage from './pages/BrandProfilePage';
import Sidebar from './components/Sidebar'; // Import the new sidebar
import './index.css'; // Make sure your global styles are imported

function App() {
  return (
    <Router>
      <div className="main-layout">
        <aside className="sidebar">
          <Sidebar />
        </aside>
        <main className="content-area">
          <Routes>
            <Route path="/" element={<AddCraftPage />} />
            <Route path="/profile" element={<BrandProfilePage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/verify/:certId?" element={<VerificationPage />} />
            <Route path="/showcase/:artisanId" element={<ShowcasePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;