import React, { useState } from 'react';
import { createProduct } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddCraftPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    materials: '',
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
    data.append('image', image);
    data.append('targetLanguage', targetLanguage); // Add language to form data

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
        <input type="file" onChange={handleFileChange} required />
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