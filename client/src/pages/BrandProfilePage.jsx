import React, { useState } from 'react';
// We will create the api.js function in the next step
import { saveArtisanProfile } from '../services/api';

const BrandProfilePage = () => {
  const [profile, setProfile] = useState({ story: '', style: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Saving...');
    await saveArtisanProfile(profile); // Assumes artisan ID 1
    setMessage('Profile saved successfully!');
  };

  return (
    <div>
      <h1>Your Brand Profile</h1>
      <p>Define your brand's voice. This will be used to personalize all AI content.</p>
      <form onSubmit={handleSubmit}>
        <textarea 
          name="story" 
          value={profile.story}
          onChange={handleChange}
          placeholder="Describe the history and passion behind your craft..."
        />
        <textarea
          name="style"
          value={profile.style}
          onChange={handleChange}
          placeholder="What are 3-5 keywords that describe your style? (e.g., rustic, minimalist, vibrant, traditional)"
        />
        <button type="submit">Save Profile</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default BrandProfilePage;