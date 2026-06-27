import React, { useState, useEffect } from 'react';
import { 
  Wrench, Zap, BookOpen, Gamepad2, Hammer, 
  Car, Cpu, Truck, Ticket, Search, ShieldCheck, 
  Star, UserCheck, MapPin, Award, Tent, ChefHat
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Plumber', icon: Wrench, count: '14 Available', desc: 'Fix leaks, piping, and bath fittings.' },
  { name: 'Electrician', icon: Zap, count: '9 Available', desc: 'Wiring, repairs, and appliance installations.' },
  { name: 'Labour', icon: Hammer, count: '28 Available', desc: 'Daily wage workers, loaders, and helpers.' },
  { name: 'Tutor', icon: BookOpen, count: '12 Available', desc: 'Home tutors for school, music, and skills.' },
  { name: 'Gaming Partner', icon: Gamepad2, count: '18 Available', desc: 'Indoor & outdoor play partners or co-players.' },
  { name: 'Booking Agent', icon: Ticket, count: '6 Available', desc: 'Flight, train, movies, and event bookings.' },
  { name: 'Car Mechanic', icon: Car, count: '8 Available', desc: 'Breakdown services, servicing, and cleaning.' },
  { name: 'Machine Mechanic', icon: Cpu, count: '5 Available', desc: 'Appliance, tool, and industrial repairers.' },
  { name: 'Delivery Boy', icon: Truck, count: '22 Available', desc: 'Courier, grocery, and local item deliveries.' },
  { name: 'Tent Man', icon: Tent, count: '4 Available', desc: 'Wedding, corporate stage, and event setups.' },
  { name: 'Chef', icon: ChefHat, count: '6 Available', desc: 'Private party gourmet chefs and caterers.' },
  { name: 'Furniture Man', icon: Hammer, count: '10 Available', desc: 'Teak wood, carpentry, and custom furniture.' }
];

const INDIAN_CITIES = [
  'Mumbai', 'Madurai', 'Mangalore', 'Mysore', 'Meerut', 'Moradabad', 'Mira-Bhayandar',
  'Delhi', 'Dehradun', 'Dhanbad', 'Durgapur', 'Darjeeling',
  'Bangalore', 'Bhopal', 'Bhubaneswar', 'Bikaner', 'Bhiwandi', 'Bhilai', 'Bareilly', 'Belgaum', 'Bhavnagar',
  'Chennai', 'Coimbatore', 'Chandigarh', 'Cuttack', 'Cochin',
  'Hyderabad', 'Howrah', 'Hubli-Dharwad',
  'Kolkata', 'Kanpur', 'Kalyan-Dombivli', 'Kochi', 'Kolhapur', 'Kota', 'Kurnool',
  'Pune', 'Patna', 'Pimpri-Chinchwad', 'Pondicherry', 'Panaji',
  'Ahmedabad', 'Amritsar', 'Agra', 'Ajmer', 'Aligarh', 'Allahabad', 'Amravati', 'Asansol', 'Aurangabad', 'Akola',
  'Gurgaon', 'Ghaziabad', 'Gwalior', 'Guwahati', 'Guntur', 'Gorakhpur', 'Gulbarga',
  'Indore', 'Imphal',
  'Jaipur', 'Jodhpur', 'Jalandhar', 'Jamshedpur', 'Jabalpur', 'Jammu', 'Jamnagar', 'Jhansi',
  'Lucknow', 'Ludhiana', 'Loni',
  'Noida', 'New Delhi', 'Nagpur', 'Nashik', 'Navi Mumbai', 'Nanded', 'Nellore',
  'Ranchi', 'Raipur', 'Rajkot', 'Rourkela',
  'Srinagar', 'Surat', 'Solapur', 'Salem', 'Saharanpur', 'Shimla',
  'Thane', 'Tiruchirappalli', 'Tiruppur', 'Trivandrum',
  'Ujjain', 'Udaipur',
  'Varanasi', 'Vadodara', 'Vijayawada', 'Visakhapatnam', 'Vasai-Virar', 'Vellore',
  'Warangal'
];

export default function Home({ onSelectCategory, onViewAllWorkers, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('Delhi');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [featuredWorkers, setFeaturedWorkers] = useState([]);

  const filteredCities = locationQuery.trim() === ''
    ? []
    : INDIAN_CITIES.filter(c => c.toLowerCase().startsWith(locationQuery.trim().toLowerCase()));

  useEffect(() => {
    // Fetch featured (highly rated and verified) workers
    fetch('/api/workers')
      .then(res => res.json())
      .then(data => {
        const verified = data.filter(w => w.isVerified).slice(0, 3);
        setFeaturedWorkers(verified);
      })
      .catch(err => console.error('Error fetching featured workers:', err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery, locationQuery);
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <h1 className="hero-title">
          Verify & Hire <span>Local Service Experts</span> Instantly
        </h1>
        <p className="hero-subtitle">
          Sticko directory. Government ID authenticated workers for home resource services, 
          academic tutoring, gaming buddies, mechanics, and logistics.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-wrapper">
          <div className="search-field" style={{ position: 'relative' }}>
            <MapPin size={18} />
            <input 
              type="text" 
              placeholder="Location..." 
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="search-input"
            />
            {showSuggestions && filteredCities.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                marginTop: '0.5rem',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                textAlign: 'left',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}>
                {filteredCities.map((city, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setLocationQuery(city);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: '0.6rem 1rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.02)',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    📍 {city}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="search-field">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search Plumbers, Electricians, Tutors, Gamers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ borderRadius: '40px', padding: '0.6rem 1.8rem' }}>
            Search
          </button>
        </form>

        {/* Trust Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
            <span>Govt ID Verified Workers</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <UserCheck size={18} style={{ color: 'var(--secondary)' }} />
            <span>Secure Customer Portal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Award size={18} style={{ color: 'var(--primary)' }} />
            <span>Updatable Listing Server</span>
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 className="category-section-title">
          <Award size={24} style={{ color: 'var(--primary)' }} /> Browse Popular Categories
        </h2>
        <div className="categories-grid">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx} 
                className="category-card"
                onClick={() => onSelectCategory(cat.name)}
              >
                <div className="icon-wrapper">
                  <Icon size={24} />
                </div>
                <div className="category-title">{cat.name}</div>
                <div className="category-desc">{cat.desc}</div>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{cat.count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Verified Workers Section */}
      {featuredWorkers.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="category-section-title">
            <ShieldCheck size={24} style={{ color: 'var(--success)' }} /> Top Verified Experts
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {featuredWorkers.map((worker) => (
              <div key={worker.id} className="card-glass" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ 
                  position: 'relative', 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  border: '1px solid var(--glass-border)', 
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-tertiary)'
                }}>
                  {worker.photo ? (
                    <img src={worker.photo} alt={worker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dim)' }}>
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div className="verification-badge" style={{ fontSize: '0.6rem', padding: '0.1rem 0' }}>
                    <ShieldCheck size={8} /> Verified
                  </div>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{worker.name}</h4>
                    <span className="worker-category-badge" style={{ fontSize: '0.65rem' }}>{worker.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0.2rem 0' }}>
                    <Star size={14} className="star-icon" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{worker.rating}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {worker.experience} Exp • {worker.address.split(',')[2] || 'Delhi'}
                  </p>
                  <button 
                    onClick={() => onSelectCategory(worker.category)} 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Info Stats Banner */}
      <section className="card-glass" style={{
        background: 'linear-gradient(135deg, rgba(27,31,43,0.8), rgba(18,21,28,0.8))',
        border: '1px solid rgba(139,92,246,0.15)',
        padding: '3rem 2rem',
        textAlign: 'center',
        borderRadius: '16px'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Are You a Service Professional?</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
          Join the Sticko directory. Register your profile, authenticate your Government ID, and start getting hired by local clients.
        </p>
        <button onClick={onViewAllWorkers} className="btn btn-primary">
          Register as Worker
        </button>
      </section>
    </div>
  );
}
