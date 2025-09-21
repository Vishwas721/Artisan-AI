import React, { useState } from 'react';
import { createProduct } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddCraftPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    materials: '',
    dimensions: '',
    useCases: '',
    careInstructions: '',
    artisanName: 'Maria', // Default name
    approxWeight: '',
    multiPurpose: '',
  });
  const [image, setImage] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [targetAudience, setTargetAudience] = useState('Default');
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
    // Append all form data fields
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('image', image);
    data.append('targetLanguage', targetLanguage);
    data.append('targetAudience', targetAudience);

    try {
      const response = await createProduct(data);
      navigate(`/products/${response.data.product.id}`);
    } catch (err) {
      setError('An error occurred during content generation. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>Add a New Craft</h1>
      <p style={{ marginTop: '-10px', marginBottom: '30px' }}>
        Upload an image and provide a few details. Our AI will handle the rest.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label>Product Name</label>
            <input type="text" name="productName" placeholder="e.g., Azure Bloom Vase" onChange={handleInputChange} required />
          </div>
          <div>
            <label>Artisan Name</label>
            <input type="text" name="artisanName" value={formData.artisanName} onChange={handleInputChange} />
          </div>
          <div>
            <label>Dimensions</label>
            <input type="text" name="dimensions" placeholder="e.g., 12x12 inches" onChange={handleInputChange} />
          </div>
          <div>
            <label>Approx. Weight</label>
            <input type="text" name="approxWeight" placeholder="e.g., 500g" onChange={handleInputChange} />
          </div>
        </div>

        <label>Care Instructions</label>
        <input type="text" name="careInstructions" placeholder="e.g., Wipe with a damp cloth" onChange={handleInputChange} />
        
        <label>Multi-Purpose Use Cases</label>
        <input type="text" name="multiPurpose" placeholder="e.g., gift packaging, table decor" onChange={handleInputChange} />

        <label>Upload Image</label>
        <input type="file" onChange={handleFileChange} required />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
            <div>
                <label htmlFor="audience-select">Target Audience</label>
                <select id="audience-select" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}>
                    <option value="Default">Default</option>
                    <option value="North Indian Wedding Market">North Indian Wedding Market</option>
                    <option value="US Home Decor Market">US Home Decor Market</option>
                </select>
            </div>
            <div>
                <label htmlFor="language-select">Translate To</label>
                <select id="language-select" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                </select>
            </div>
        </div>
        
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '24px' }}>
          {loading ? 'Generating...' : 'Generate Content & Publish'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '16px' }}>{error}</p>}
    </div>
  );
};

export default AddCraftPage;

