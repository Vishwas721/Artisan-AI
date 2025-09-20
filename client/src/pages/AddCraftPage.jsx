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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
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
    setResult(null);

    const data = new FormData();
    data.append('productName', formData.productName);
    data.append('category', formData.category);
    data.append('materials', formData.materials);
    data.append('image', image);

    try {
      const response = await createProduct(data);
      setResult(response.data);
navigate(`/products/${response.data.product.id}`); // Correct
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
        <input type="text" name="category" placeholder="Category (e.g., Pottery)" onChange={handleInputChange} />
        <input type="text" name="materials" placeholder="Materials (e.g., Terracotta Clay)" onChange={handleInputChange} />
        <input type="file" onChange={handleFileChange} required />
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Content'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div>
          <h2>Generation Complete!</h2>
          <p><strong>Description:</strong> {result.ai_description}</p>
          <p><strong>Story:</strong> {result.ai_story}</p>
          <p><strong>Blockchain Certificate ID:</strong> {result.blockchain_cert_id}</p>
        </div>
      )}
    </div>
  );
};

export default AddCraftPage;