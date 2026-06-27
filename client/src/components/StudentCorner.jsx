import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, BookOpen, Briefcase, Award, MapPin, 
  ShieldCheck, Star, Users, PlusCircle, Check
} from 'lucide-react';

export default function StudentCorner({ currentUser, onPromptLogin, onSelectCategory }) {
  const [gamers, setGamers] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [activeTab, setActiveTab] = useState('gaming'); // gaming, tutoring, gigs
  
  // Game filters
  const [gameFilter, setGameFilter] = useState('All');
  const [gameType, setGameType] = useState('All'); // Indoor, Outdoor, Esports

  // New Gig Form
  const [showGigModal, setShowGigModal] = useState(false);
  const [newGigTitle, setNewGigTitle] = useState('');
  const [newGigDesc, setNewGigDesc] = useState('');
  const [newGigCompany, setNewGigCompany] = useState('');
  const [newGigSalary, setNewGigSalary] = useState('');
  const [newGigLocation, setNewGigLocation] = useState('');
  const [newGigType, setNewGigType] = useState('Part-Time');
  const [gigSuccess, setGigSuccess] = useState(false);

  // Apply to Gig State
  const [appliedGigId, setAppliedGigId] = useState(null);

  useEffect(() => {
    // Fetch all workers and separate student services
    fetch('http://127.0.0.1:5000/api/workers')
      .then(res => res.json())
      .then(data => {
        // Gaming Partners
        const gamePartners = data.filter(w => w.category === 'Gaming Partner');
        setGamers(gamePartners);

        // Tutors
        const academicTutors = data.filter(w => w.category === 'Tutor');
        setTutors(academicTutors);
      })
      .catch(err => console.error('Error fetching workers for student section:', err));

    // Fetch gigs
    fetch('http://127.0.0.1:5000/api/gigs')
      .then(res => res.json())
      .then(data => setGigs(data))
      .catch(err => console.error('Error fetching student gigs:', err));
  }, []);

  const handleCreateGig = (e) => {
    e.preventDefault();
    const payload = {
      title: newGigTitle,
      description: newGigDesc,
      company: newGigCompany,
      salary: newGigSalary,
      location: newGigLocation,
      type: newGigType
    };

    fetch('http://127.0.0.1:5000/api/gigs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setGigs(prev => [data, ...prev]);
        setGigSuccess(true);
        setTimeout(() => {
          setShowGigModal(false);
          setGigSuccess(false);
          setNewGigTitle('');
          setNewGigDesc('');
          setNewGigCompany('');
          setNewGigSalary('');
          setNewGigLocation('');
        }, 1500);
      })
      .catch(err => console.error('Error creating gig:', err));
  };

  const handleApplyGig = (id) => {
    if (!currentUser) {
      onPromptLogin();
      return;
    }
    setAppliedGigId(id);
    setTimeout(() => setAppliedGigId(null), 2500);
  };

  // Filter play partners
  const filteredGamers = gamers.filter(gamer => {
    if (gameFilter !== 'All') {
      return gamer.games?.includes(gameFilter);
    }
    return true;
  });

  return (
    <div className="container">
      {/* Student Cyberpunk Header Banner */}
      <div className="student-corner-header">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>
          🎓 Student Corner
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
          Find study tutors, hook up with gaming buddies for indoor/outdoor matches, and secure local part-time jobs.
        </p>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className={`btn ${activeTab === 'gaming' ? 'btn-accent' : 'btn-secondary'}`}
            onClick={() => setActiveTab('gaming')}
          >
            <Gamepad2 size={16} /> Gaming Partners
          </button>
          <button 
            className={`btn ${activeTab === 'tutoring' ? 'btn-accent' : 'btn-secondary'}`}
            onClick={() => setActiveTab('tutoring')}
          >
            <BookOpen size={16} /> Student Tutors
          </button>
          <button 
            className={`btn ${activeTab === 'gigs' ? 'btn-accent' : 'btn-secondary'}`}
            onClick={() => setActiveTab('gigs')}
          >
            <Briefcase size={16} /> Part-Time Gigs
          </button>
        </div>
      </div>

      {/* GAMING PARTNERS SECTION */}
      {activeTab === 'gaming' && (
        <section className="student-grid-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Find Co-Players & Gaming Buddies</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Play indoor board games, outdoor court matches, or Esports</p>
            </div>
            
            {/* Quick Game filters */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['All', 'Chess', 'Badminton', 'Valorant', 'Football', 'Table Tennis'].map(game => (
                <button 
                  key={game} 
                  className={`btn ${gameFilter === game ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  onClick={() => setGameFilter(game)}
                >
                  {game}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredGamers.map(gamer => (
              <div key={gamer.id} className="card-glass student-card-glow" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)' }}>
                      {gamer.photo ? (
                        <img src={gamer.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dim)' }}>
                          {gamer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {gamer.name} 
                        {gamer.isVerified && <ShieldCheck size={14} style={{ color: 'var(--success)' }} />}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{gamer.experience}</span>
                    </div>
                  </div>

                  <div className="game-badges">
                    {gamer.games?.map((game, i) => (
                      <span key={i} className="game-badge">{game}</span>
                    ))}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                    📍 {gamer.address.split(',')[1] || gamer.address}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{gamer.hourlyRate}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/hr</span></span>
                  <button 
                    onClick={() => onSelectCategory('Gaming Partner')} 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  >
                    Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TUTORS SECTION */}
      {activeTab === 'tutoring' && (
        <section className="student-grid-section">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Top Tutors & Mentors</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Hire home tutors for children, computer coding, languages, and music lessons</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {tutors.map(tutor => (
              <div key={tutor.id} className="card-glass" style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)' }}>
                  {tutor.photo ? (
                    <img src={tutor.photo} alt={tutor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dim)' }}>
                      {tutor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  {tutor.isVerified && (
                    <div className="verification-badge" style={{ fontSize: '0.6rem', padding: '0.1rem 0' }}>
                      <ShieldCheck size={8} /> Verified
                    </div>
                  )}
                </div>
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{tutor.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', margin: '0.2rem 0' }}>
                      <Star size={12} className="star-icon" />
                      <span style={{ fontWeight: 600 }}>{tutor.rating}</span>
                      <span style={{ color: 'var(--text-dim)' }}>({tutor.reviews?.length || 0} reviews)</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      🎓 {tutor.experience} • Verified credentials
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: 700 }}>₹{tutor.hourlyRate}/hr</span>
                    <button 
                      onClick={() => onSelectCategory('Tutor')} 
                      className="btn btn-primary" 
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    >
                      Book Class
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PART-TIME GIGS SECTION */}
      {activeTab === 'gigs' && (
        <section className="student-grid-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Part-time Gigs & Jobs</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Flexible gigs to earn pocket money during college</p>
            </div>
            <button 
              className="btn btn-accent" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setShowGigModal(true)}
            >
              <PlusCircle size={16} /> Post a Gig
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {gigs.map(gig => (
              <div key={gig.id} className="card-glass gig-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>{gig.title}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{gig.company}</span>
                    </div>
                    <span className="worker-category-badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)', borderColor: 'rgba(6,182,212,0.3)' }}>
                      {gig.type}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {gig.description}
                  </p>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    📍 Location: {gig.location}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                  <div className="gig-salary">{gig.salary}</div>
                  <button 
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                    onClick={() => handleApplyGig(gig.id)}
                  >
                    {appliedGigId === gig.id ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)' }}>
                        <Check size={14} /> Applied
                      </span>
                    ) : 'Apply Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Post a Gig Modal */}
      {showGigModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Post a Student Gig</h3>
              <button className="close-btn" onClick={() => setShowGigModal(false)}>✕</button>
            </div>
            
            {gigSuccess ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <ShieldCheck size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                <h4 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Gig Posted Successfully!</h4>
                <p style={{ color: 'var(--text-muted)' }}>It will appear on the gigs board instantly.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateGig}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Gig Title</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="e.g. Science Fair Lab Assistant"
                      value={newGigTitle}
                      onChange={(e) => setNewGigTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company / Organizer Name</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="e.g. Apex High School or Cafe Nero"
                      value={newGigCompany}
                      onChange={(e) => setNewGigCompany(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pay / Salary Details</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="e.g. ₹200 / hr or ₹1500 per day"
                      value={newGigSalary}
                      onChange={(e) => setNewGigSalary(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="e.g. Sector 62, Noida or Remote"
                      value={newGigLocation}
                      onChange={(e) => setNewGigLocation(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select 
                      className="form-select"
                      value={newGigType}
                      onChange={(e) => setNewGigType(e.target.value)}
                    >
                      <option value="Part-Time">Part-Time</option>
                      <option value="One-Off">One-Off Gig</option>
                      <option value="Weekend Only">Weekend Only</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description / Qualifications</label>
                    <textarea 
                      rows="4" 
                      required
                      placeholder="Describe what the student will be doing and any requirements..."
                      className="form-textarea"
                      value={newGigDesc}
                      onChange={(e) => setNewGigDesc(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowGigModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-accent">Post Gig Listing</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
