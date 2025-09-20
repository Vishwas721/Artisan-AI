import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../services/api'; // Import the new function

const ProductPage = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to fetch product details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // This effect runs whenever the 'id' in the URL changes

  if (loading) return <div>Loading product details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!product) return <div>Product not found.</div>;

  // Once loaded, display the product details
  return (
    <div>
      <h1>{product.product_name}</h1>
      <img 
        src={`http://localhost:5001/${product.image_url}`} 
        alt={product.product_name} 
        width="400" 
      />
      <h2>The Story Behind the Craft</h2>
      <p>{product.ai_story}</p>
      <h2>Description</h2>
      <p>{product.ai_description}</p>
      <h3>Blockchain Certificate ID:</h3>
      <p>{product.blockchain_cert_id}</p>
    </div>
  );
};

export default ProductPage;