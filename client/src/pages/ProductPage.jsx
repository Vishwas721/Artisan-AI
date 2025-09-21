import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, generateSocialPlan, updateProduct, regenerateContent } from '../services/api';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editable content states
  const [editableStory, setEditableStory] = useState({});
  const [editableDesc, setEditableDesc] = useState({});

  const [lang, setLang] = useState('en');
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        setProduct(response.data);
        // Initialize editable states with fetched data
        setEditableStory(response.data.ai_story);
        setEditableDesc(response.data.ai_description);
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSaveChanges = async () => {
    try {
      await updateProduct(id, {
        ai_story: editableStory,
        ai_description: editableDesc
      });
      alert('Changes saved!');
    } catch (err) {
      alert('Failed to save changes.');
    }
  };

  const handleRegenerate = async (field, tone) => {
    const originalContent = (field === 'story') ? editableStory[lang]?.story : editableDesc[lang]?.description;

    try {
      const response = await regenerateContent(id, { field, tone, originalContent });
      const newContent = response.data.newContent;

      if (field === 'story') {
        setEditableStory(prev => ({ ...prev, [lang]: { ...prev[lang], story: newContent }}));
      } else {
        setEditableDesc(prev => ({ ...prev, [lang]: { ...prev[lang], description: newContent }}));
      }
    } catch (err) {
      alert(`Failed to regenerate ${field}.`);
    }
  };

  const handleGeneratePlan = async () => {
  setPlanLoading(true);
  try {
    const response = await generateSocialPlan(id);
    setPlan(response.data);
  } catch (err) {
    console.error("Failed to generate social plan:", err);
    alert("Failed to generate the social plan.");
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
      <img src={product.image_url} alt={product.product_name} width="400" />

      <div>{languages.map(l => <button key={l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div>

      <h2>The Story Behind the Craft</h2>
      <textarea 
        value={editableStory[lang]?.story || ''} 
        onChange={(e) => setEditableStory(prev => ({...prev, [lang]: {...prev[lang], story: e.target.value}}))} 
        rows="6" style={{width: '100%'}} 
      />
      <button onClick={() => handleRegenerate('story', 'more poetic')}>Make More Poetic</button>
      <button onClick={() => handleRegenerate('story', 'shorter')}>Make Shorter</button>

      <h2>Description</h2>
      <textarea 
        value={editableDesc[lang]?.description || ''}
        onChange={(e) => setEditableDesc(prev => ({...prev, [lang]: {...prev[lang], description: e.target.value}}))}
        rows="6" style={{width: '100%'}}
      />
      <button onClick={() => handleRegenerate('description', 'more professional')}>More Professional</button>

      <button onClick={handleSaveChanges} style={{marginTop: '10px', background: 'green', color: 'white'}}>Save All Changes</button>

      <h3>Blockchain Certificate ID:</h3>
      <Link to={`/verify/${product.blockchain_cert_id}`}>{product.blockchain_cert_id}</Link>
            {product.hashtags && product.hashtags.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Suggested Hashtags</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {product.hashtags.map((tag, index) => (
              <span key={index} style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '12px', fontSize: '14px' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
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