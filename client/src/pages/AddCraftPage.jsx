import React, { useState } from 'react';
import { createProduct } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const AddCraftPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    materials: '',
    dimensions: '',
    useCases: '',
    careInstructions: '',
    artisanName: 'Maria',
    approxWeight: '',
    multiPurpose: '',
  });
  const [image, setImage] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [targetAudience, setTargetAudience] = useState('Default'); // New State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please upload an image.');
      return;
    }
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('image', image);
    data.append('targetLanguage', targetLanguage);
    data.append('targetAudience', targetAudience); // Add audience to form data

    try {
      const response = await createProduct(data);
      navigate(`/products/${response.data.product.id}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ padding: '10px', background: '#f0f0f0', textAlign: 'center', marginBottom: '24px' }}>
        <Link to="/profile">Edit Brand Profile</Link> | <Link to="/showcase/1">View My Public Showcase</Link>
      </div>
      
      <h1>Add Your Craft</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="productName" placeholder="Product Name" onChange={handleInputChange} required />
        <input type="text" name="artisanName" placeholder="Artisan Name (e.g., Maria)" value={formData.artisanName} onChange={handleInputChange} />
        <input type="text" name="dimensions" placeholder="Dimensions (e.g., 12x12 inches)" onChange={handleInputChange} />
        <input type="text" name="approxWeight" placeholder="Approx. Weight (e.g., 500g)" onChange={handleInputChange} />
        <input type="text" name="careInstructions" placeholder="Care Instructions (e.g., Wipe with a damp cloth)" onChange={handleInputChange} />
        <input type="text" name="multiPurpose" placeholder="More uses (e.g., gift packaging, table decor)" onChange={handleInputChange} />
        <input type="file" onChange={handleFileChange} required />
        
        {/* --- NEW DROPDOWN --- */}
        <label htmlFor="audience-select" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Target Audience for AI Assistance:</label>
        <select id="audience-select" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}>
          <option value="Default">Default</option>
          <option value="North Indian Wedding Market">North Indian Wedding Market</option>
          <option value="US Home Decor Market">US Home Decor Market</option>
        </select>
        {/* --- END OF NEW DROPDOWN --- */}

        <label htmlFor="language-select" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', marginTop: '16px' }}>Select Language:</label>
        <select id="language-select" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
          <option value="hi">Hindi</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
        
        <button type="submit" disabled={loading} style={{ marginTop: '24px' }}>
          {loading ? 'Generating...' : 'Generate Content'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AddCraftPage;

