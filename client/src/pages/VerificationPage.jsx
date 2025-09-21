import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verifyCertificate } from '../services/api';

const VerificationPage = () => {
  const { certId: paramCertId } = useParams();
  const [certId, setCertId] = useState(paramCertId || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!certId) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await verifyCertificate(certId);
      setResult(response.data.story_from_blockchain);
    } catch (err) {
      setError('Failed to verify certificate.');
    } finally {
      setLoading(false);
    }
  };
  
  // Automatically verify if the ID is in the URL
  useEffect(() => {
    if (paramCertId) {
      handleVerify();
    }
  }, [paramCertId]);

  return (
    <div>
      <h1>Verify Certificate of Authenticity</h1>
      <input 
        type="text" 
        value={certId}
        onChange={(e) => setCertId(e.target.value)}
        placeholder="Enter Certificate ID (e.g., ART-CERT-1)"
      />
      <button onClick={handleVerify} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {result && (
        <div>
          <h2>Verification Result:</h2>
          <p><strong>Story from Blockchain:</strong> {result}</p>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;