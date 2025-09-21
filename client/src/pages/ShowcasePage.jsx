import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getShowcase } from '../services/api';

const ShowcasePage = () => {
  const { artisanId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const response = await getShowcase(artisanId);
        setProducts(response.data);
      } catch (err) {
        console.error("Failed to fetch showcase", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShowcase();
  }, [artisanId]);

  if (loading) return <div>Loading showcase...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Artisan Showcase</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map(product => (
          <Link to={`/products/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <img src={product.image_url} alt={product.product_name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <h3 style={{ padding: '10px' }}>{product.product_name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ShowcasePage;