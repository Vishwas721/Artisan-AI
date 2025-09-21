import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getShowcase } from '../services/api';

const ShowcasePage = () => {
  const { artisanId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Styles for the grid and cards
  const styles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '30px',
    },
    card: {
      backgroundColor: 'var(--card-background)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px var(--shadow-color)',
      textDecoration: 'none',
      color: 'var(--text-color)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    cardImage: {
      width: '100%',
      height: '220px',
      objectFit: 'cover',
    },
    cardContent: {
      padding: '16px 20px',
    },
  };

  useEffect(() => {
    // Fetch showcase data...
    getShowcase(artisanId).then(res => setProducts(res.data)).finally(() => setLoading(false));
  }, [artisanId]);

  if (loading) return <div>Loading showcase...</div>;

  return (
    <div>
      <h1>My Showcase</h1>
      <div style={styles.grid}>
        {products.map(product => (
          <Link to={`/products/${product.id}`} key={product.id} style={styles.card}>
            <img src={product.image_url} alt={product.product_name} style={styles.cardImage} />
            <div style={styles.cardContent}>
              <h3>{product.product_name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ShowcasePage;