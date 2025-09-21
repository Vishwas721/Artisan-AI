import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, generateSocialPlan } from '../services/api';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('en'); // 'en' for English
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleGeneratePlan = async () => {
    setPlanLoading(true);
    try {
      const response = await generateSocialPlan(id);
      setPlan(response.data);
    } catch (err) {
      console.error("Failed to generate plan");
    } finally {
      setPlanLoading(false);
    }
  };

  if (loading) return <div>Loading product details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!product) return <div>Product not found.</div>;

  const languages = product.ai_story ? Object.keys(product.ai_story) : [];

  return (
    <div>
      <h1>{product.product_name}</h1>
      <img src={`http://127.0.0.1:5001/${product.image_url}`} alt={product.product_name} width="400" />
      
      <div>
        {languages.map(l => <button key={l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}
      </div>

      <h2>The Story Behind the Craft</h2>
      <p>{product.ai_story[lang]?.story || 'Not available'}</p>
      <h2>Description</h2>
      <p>{product.ai_description[lang]?.description || 'Not available'}</p>
      
      <h3>Blockchain Certificate ID:</h3>
      <Link to={`/verify/${product.blockchain_cert_id}`}>{product.blockchain_cert_id}</Link>

      <hr />
      
      <h2>Marketing Assistant</h2>
      <button onClick={handleGeneratePlan} disabled={planLoading}>
        {planLoading ? 'Generating Plan...' : 'Generate Social Media Plan'}
      </button>

      {plan && (
        <div>
          <h3>Your 3-Day Social Media Plan:</h3>
          {plan.map(p => (
            <div key={p.day}>
              <h4>Day {p.day} ({p.post_type})</h4>
              <p><strong>Caption:</strong> {p.caption}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPage;