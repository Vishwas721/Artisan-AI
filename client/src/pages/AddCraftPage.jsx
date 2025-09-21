import React, { useState } from 'react';
import { createProduct } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddCraftPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    materials: '',
    dimensions: '', // Add this
    useCases: '',
      careInstructions: '', // Add this
  artisanName: 'Maria', 
    approxWeight: '',       // Add this
  multiPurpose: '', // Add this
  });
  const [image, setImage] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('hi'); // Default to Hindi
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
    data.append('productName', formData.productName);
    data.append('category', formData.category);
    data.append('materials', formData.materials);
      data.append('dimensions', formData.dimensions); // Add this
  data.append('useCases', formData.useCases);   
    data.append('image', image);
    data.append('targetLanguage', targetLanguage); 
    data.append('careInstructions', formData.careInstructions);
data.append('artisanName', formData.artisanName);
data.append('approxWeight', formData.approxWeight);
data.append('multiPurpose', formData.multiPurpose);// Add language to form data

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
      <h1>Add Your Craft</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="productName" placeholder="Product Name" onChange={handleInputChange} required />
        <input type="text" name="category" placeholder="Category" onChange={handleInputChange} />
        <input type="text" name="materials" placeholder="Materials" onChange={handleInputChange} />
        <input type="text" name="dimensions" placeholder="Dimensions (e.g., 12x12 inches)" onChange={handleInputChange} />
  <input type="text" name="useCases" placeholder="Ideal use cases (e.g., meditation room, desk decor)" onChange={handleInputChange} />
    <input type="text" name="artisanName" placeholder="Artisan Name (e.g., Maria)" value={formData.artisanName} onChange={handleInputChange} />
  <input type="text" name="careInstructions" placeholder="Care Instructions (e.g., Wipe with a damp cloth)" onChange={handleInputChange} />
    <input type="text" name="approxWeight" placeholder="Approx. Weight (e.g., 500g)" onChange={handleInputChange} />
  <input type="text" name="multiPurpose" placeholder="More uses (e.g., gift packaging, table decor)" onChange={handleInputChange} />
  <input type="file" onChange={handleFileChange} required />
  {/* ... rest of the form ... */}
        <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
          <option value="hi">Hindi</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Content'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AddCraftPage;