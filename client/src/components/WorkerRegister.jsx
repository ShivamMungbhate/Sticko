import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Info, CheckCircle } from 'lucide-react';

const CATEGORIES = [
  'Plumber', 'Electrician', 'Labour', 'Tutor', 'Gaming Partner', 
  'Booking Agent', 'Car Mechanic', 'Machine Mechanic', 'Delivery Boy'
];

const PRESET_AVATARS = [
  { url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&h=150&fit=crop&crop=face', name: 'Avatar 1' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', name: 'Avatar 2' },
  { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', name: 'Avatar 3' },
  { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', name: 'Avatar 4' },
  { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face', name: 'Avatar 5' },
  { url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face', name: 'Avatar 6' },
  { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face', name: 'Avatar 7' }
];

export default function WorkerRegister({ onRegistrationSuccess }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Plumber');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [govtId, setGovtId] = useState('');
  const [photo, setPhoto] = useState(PRESET_AVATARS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [experience, setExperience] = useState('2 years');
  const [hourlyRate, setHourlyRate] = useState('200');
  
  // Gaming fields
  const [gamesList, setGamesList] = useState('');
  
  // Submit state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Format games list if gaming partner
    const games = category === 'Gaming Partner' 
      ? gamesList.split(',').map(g => g.trim()).filter(g => g !== '') 
      : [];

    const finalPhoto = customPhotoUrl ? customPhotoUrl : photo;

    const payload = {
      name,
      category,
      mobile,
      email,
      address,
      govtId,
      photo: finalPhoto,
      experience,
      hourlyRate: Number(hourlyRate),
      games,
      studentSection: category === 'Tutor' || category === 'Gaming Partner'
    };

    fetch('http://127.0.0.1:5000/api/workers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onRegistrationSuccess();
        }, 2000);
      })
      .catch(err => {
        console.error('Worker registration error:', err);
        setError('Error submitting registration. Please check server connections.');
      });
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', margin: '2rem auto' }}>
      <div className="card-glass" style={{ width: '100%', maxWidth: '650px', padding: '2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyOrigin: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <UserPlus size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Worker Service Registration</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Register your trade. Provide details and your Government ID to get verified by the server.
          </p>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{error}</div>}
        {success && (
          <div style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)', padding: '1rem', borderRadius: '8px', fontSize: '0.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <CheckCircle size={18} /> Profile registered! Pending Govt ID review by Server administrator.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Rahul Verma"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Service Category</label>
              <select 
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input 
                type="tel" 
                required 
                placeholder="9876543210"
                className="form-input"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="rahul@example.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Service / Home Address</label>
              <input 
                type="text" 
                required 
                placeholder="Flat 101, Block B, Sector 62, Noida, UP"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Government ID Type & Number</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Aadhaar: 1234-5678-9012"
                className="form-input"
                value={govtId}
                onChange={(e) => setGovtId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Experience</label>
              <input 
                type="text" 
                placeholder="e.g. 5 years"
                className="form-input"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hourly Rate (INR ₹)</label>
              <input 
                type="number" 
                required 
                placeholder="250"
                className="form-input"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </div>

            {category === 'Gaming Partner' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Games Played (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Chess, Table Tennis, Badminton, Valorant"
                  className="form-input"
                  value={gamesList}
                  onChange={(e) => setGamesList(e.target.value)}
                />
              </div>
            )}

            {/* Profile Photo selector */}
            <div className="form-group" style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
              <label className="form-label">Select Profile Photo Avatar</label>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                {PRESET_AVATARS.map((av, idx) => (
                  <img 
                    key={idx} 
                    src={av.url} 
                    alt={av.name}
                    onClick={() => { setPhoto(av.url); setCustomPhotoUrl(''); }}
                    style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '8px', 
                      objectFit: 'cover', 
                      cursor: 'pointer',
                      border: photo === av.url && !customPhotoUrl ? '2px solid var(--primary)' : '2px solid transparent',
                      opacity: photo === av.url && !customPhotoUrl ? 1 : 0.6
                    }}
                  />
                ))}
              </div>
              <label className="form-label">Or paste custom Image URL</label>
              <input 
                type="url" 
                placeholder="https://example.com/photo.jpg"
                className="form-input"
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
              />
            </div>
          </div>

          <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Note: Unverified accounts can be seen by administrators. Administration requires the password `root` to enable full public hiring.
            </span>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
}
