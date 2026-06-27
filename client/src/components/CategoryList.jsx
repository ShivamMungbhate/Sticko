import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Star, Phone, Mail, MapPin, 
  Award, DollarSign, Filter, ChevronDown, MessageSquare
} from 'lucide-react';

export default function CategoryList({ category, currentUser, onPromptLogin, searchParams }) {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState(null);
  const [selectedWorkerForReview, setSelectedWorkerForReview] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingHours, setBookingHours] = useState('2');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');

  // Fetch Workers
  useEffect(() => {
    setLoading(true);
    let url = '/api/workers';
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    } else if (searchParams && searchParams.query) {
      url += `?search=${encodeURIComponent(searchParams.query)}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setWorkers(data);
        setFilteredWorkers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching workers:', err);
        setLoading(false);
      });
  }, [category, searchParams]);

  // Apply filters
  useEffect(() => {
    let result = [...workers];
    if (onlyVerified) {
      result = result.filter(w => w.isVerified);
    }
    if (minRating > 0) {
      result = result.filter(w => w.rating >= minRating);
    }
    if (maxPrice < 1000) {
      result = result.filter(w => w.hourlyRate <= maxPrice);
    }
    setFilteredWorkers(result);
  }, [onlyVerified, minRating, maxPrice, workers]);

  const handleOpenBooking = (worker) => {
    if (!currentUser) {
      onPromptLogin();
      return;
    }
    setSelectedWorkerForBooking(worker);
    setBookingSuccess(false);
  };

  const handleBookWorker = (e) => {
    e.preventDefault();
    if (!currentUser || !selectedWorkerForBooking) return;

    const bookingPayload = {
      userId: currentUser.id,
      userName: currentUser.name,
      workerId: selectedWorkerForBooking.id,
      workerName: selectedWorkerForBooking.name,
      workerCategory: selectedWorkerForBooking.category,
      date: bookingDate,
      hours: Number(bookingHours),
      notes: bookingNotes
    };

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    })
      .then(res => res.json())
      .then(data => {
        setBookingSuccess(true);
        setTimeout(() => {
          setSelectedWorkerForBooking(null);
          setBookingDate('');
          setBookingHours('2');
          setBookingNotes('');
        }, 1500);
      })
      .catch(err => console.error('Booking error:', err));
  };

  const handlePostReview = (e) => {
    e.preventDefault();
    if (!selectedWorkerForReview) return;

    const reviewPayload = {
      user: reviewName || currentUser?.name || 'Anonymous User',
      rating: Number(reviewRating),
      comment: reviewComment
    };

    fetch(`/api/workers/${selectedWorkerForReview.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewPayload)
    })
      .then(res => res.json())
      .then(data => {
        // Update current workers list
        setWorkers(prev => prev.map(w => w.id === selectedWorkerForReview.id ? data.worker : w));
        // Reset state
        setSelectedWorkerForReview(null);
        setReviewName('');
        setReviewRating('5');
        setReviewComment('');
      })
      .catch(err => console.error('Review submit error:', err));
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem 0' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {category ? `${category}s Near You` : searchParams?.query ? `Search Results for "${searchParams.query}"` : 'All Listed Workers'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Showing {filteredWorkers.length} service professionals
          </p>
        </div>
      </div>

      <div className="workers-layout">
        {/* Filter Side Panel */}
        <aside className="card-glass filter-panel">
          <h3 className="filter-title">
            <Filter size={18} style={{ color: 'var(--primary)' }} /> Refine Search
          </h3>
          
          <div className="filter-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={onlyVerified} 
                onChange={(e) => setOnlyVerified(e.target.checked)}
                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
              />
              <span style={{ color: 'var(--text-main)' }}>Govt ID Verified Only</span>
            </label>
          </div>

          <div className="filter-group">
            <label className="form-label">Minimum Rating</label>
            <select 
              className="form-select" 
              value={minRating} 
              onChange={(e) => setMinRating(Number(e.target.value))}
            >
              <option value="0">All Ratings</option>
              <option value="4.8">⭐⭐⭐⭐⭐ 4.8+</option>
              <option value="4.5">⭐⭐⭐⭐ 4.5+</option>
              <option value="4.0">⭐⭐⭐⭐ 4.0+</option>
            </select>
          </div>

          <div className="filter-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label">Max Hourly Rate</label>
              <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>₹{maxPrice}/hr</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="1000" 
              step="50"
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              <span>₹100</span>
              <span>₹1000+</span>
            </div>
          </div>
        </aside>

        {/* Worker Cards Grid */}
        <main className="workers-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <div className="animate-pulse" style={{ fontSize: '1.25rem' }}>Connecting to listings server...</div>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="card-glass" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No workers match your active filters.</p>
              <button 
                className="btn btn-secondary"
                onClick={() => { setOnlyVerified(false); setMinRating(0); setMaxPrice(1000); }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredWorkers.map(worker => (
              <div key={worker.id} className="card-glass worker-card">
                {/* Photo with Badge */}
                <div className="worker-avatar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)' }}>
                  {worker.photo ? (
                    <img src={worker.photo} alt={worker.name} className="worker-photo" />
                  ) : (
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dim)' }}>
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div className={`verification-badge ${!worker.isVerified ? 'unverified' : ''}`}>
                    <ShieldCheck size={12} />
                    <span>{worker.isVerified ? 'Govt Verified' : 'Pending ID Check'}</span>
                  </div>
                </div>

                {/* Main Details */}
                <div className="worker-details">
                  <div>
                    <div className="worker-name-row">
                      <h3 className="worker-name">{worker.name}</h3>
                      <span className="worker-category-badge">{worker.category}</span>
                    </div>

                    <div className="worker-rating-row">
                      <Star size={16} className="star-icon" />
                      <span className="worker-rating-value">{worker.rating}</span>
                      <span className="worker-rating-count">({worker.reviews?.length || 0} reviews)</span>
                    </div>

                    {/* Contact Details (Requirement 4) */}
                    <div className="worker-contact-info">
                      <div className="contact-item">
                        <Phone />
                        <span>+91 {worker.mobile}</span>
                      </div>
                      <div className="contact-item">
                        <Mail />
                        <span>{worker.email}</span>
                      </div>
                      <div className="contact-item" style={{ gridColumn: 'span 2' }}>
                        <MapPin />
                        <span>{worker.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Showcase */}
                  {worker.portfolio && worker.portfolio.length > 0 && (
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>📂 Works & Projects Portfolio</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                        {worker.portfolio.map((project, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              position: 'relative', 
                              width: '90px', 
                              height: '65px', 
                              borderRadius: '6px', 
                              overflow: 'hidden', 
                              border: '1px solid var(--glass-border)',
                              flexShrink: 0,
                              cursor: 'pointer'
                            }}
                            title={project.title}
                            onClick={() => setViewingProject(project)}
                          >
                            <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'rgba(0,0,0,0.85)',
                              color: '#fff',
                              fontSize: '0.55rem',
                              padding: '0.1rem 0.25rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              textAlign: 'center'
                            }}>
                              {project.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="worker-meta">
                    <div className="worker-meta-item">
                      <span>Experience:</span>
                      <strong>{worker.experience}</strong>
                    </div>
                    <div className="worker-meta-item">
                      <span>Govt ID Details:</span>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{worker.govtId}</strong>
                    </div>
                  </div>
                </div>

                {/* Call to Actions */}
                <div className="worker-action">
                  <div>
                    <div className="worker-rate">
                      ₹{worker.hourlyRate}<span>/hr</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    <button 
                      onClick={() => handleOpenBooking(worker)}
                      className="btn btn-primary"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      Hire Expert
                    </button>
                    <button 
                      onClick={() => setSelectedWorkerForReview(worker)}
                      className="btn btn-secondary"
                      style={{ width: '100%', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}
                    >
                      <MessageSquare size={14} /> Reviews
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </main>
      </div>

      {/* Booking Form Modal */}
      {selectedWorkerForBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Book Service: {selectedWorkerForBooking.name}</h3>
              <button className="close-btn" onClick={() => setSelectedWorkerForBooking(null)}>✕</button>
            </div>
            
            {bookingSuccess ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <ShieldCheck size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                <h4 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Booking Placed Successfully!</h4>
                <p style={{ color: 'var(--text-muted)' }}>Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleBookWorker}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Service Provider</label>
                    <div className="card-glass" style={{ padding: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {selectedWorkerForBooking.photo ? (
                        <img src={selectedWorkerForBooking.photo} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                          {selectedWorkerForBooking.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <strong>{selectedWorkerForBooking.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedWorkerForBooking.category} • ₹{selectedWorkerForBooking.hourlyRate}/hr</div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Choose Date</label>
                    <input 
                      type="date" 
                      required 
                      className="form-input"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Required Hours</label>
                    <select 
                      className="form-select"
                      value={bookingHours}
                      onChange={(e) => setBookingHours(e.target.value)}
                    >
                      <option value="1">1 Hour</option>
                      <option value="2">2 Hours</option>
                      <option value="4">4 Hours (Half Day)</option>
                      <option value="8">8 Hours (Full Day)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Task Details / Instructions</label>
                    <textarea 
                      rows="3" 
                      placeholder="Explain the work required..."
                      className="form-textarea"
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Bill:</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--success)' }}>
                      ₹{selectedWorkerForBooking.hourlyRate * Number(bookingHours)}
                    </strong>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedWorkerForBooking(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Confirm Hiring</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reviews & Review Addition Modal */}
      {selectedWorkerForReview && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Reviews for {selectedWorkerForReview.name}</h3>
              <button className="close-btn" onClick={() => setSelectedWorkerForReview(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              {/* Existing Reviews */}
              <div style={{ marginBottom: '2rem', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Client Feedback</h4>
                {selectedWorkerForReview.reviews?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No reviews yet. Be the first to review!</p>
                ) : (
                  selectedWorkerForReview.reviews.map((rev, index) => (
                    <div key={index} className="card-glass" style={{ padding: '0.75rem', background: 'var(--bg-tertiary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <strong>{rev.user}</strong>
                        <span style={{ color: 'var(--text-dim)' }}>{rev.date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={12} className="star-icon" />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>"{rev.comment}"</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add a Review Form */}
              <form onSubmit={handlePostReview} style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>Write a Review</h4>
                
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter your name" 
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Rating</label>
                    <select 
                      className="form-select"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(e.target.value)}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                      <option value="4">⭐⭐⭐⭐ Good (4/5)</option>
                      <option value="3">⭐⭐⭐ Average (3/5)</option>
                      <option value="2">⭐⭐ Fair (2/5)</option>
                      <option value="1">⭐ Poor (1/5)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Comment</label>
                  <textarea 
                    rows="3" 
                    className="form-textarea" 
                    placeholder="Describe your experience with this professional..."
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Project Portfolio Lightbox Modal */}
      {viewingProject && (
        <div className="modal-overlay" onClick={() => setViewingProject(null)} style={{ zIndex: 300 }}>
          <div className="modal-content" style={{ maxWidth: '500px', background: 'transparent', border: 'none', boxShadow: 'none', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative' }}>
              <img src={viewingProject.image} alt={viewingProject.title} style={{ width: '100%', borderRadius: '12px', border: '2px solid var(--primary)', boxShadow: '0 0 30px var(--primary-glow)', maxHeight: '70vh', objectFit: 'contain' }} />
              <button 
                onClick={() => setViewingProject(null)} 
                style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--primary)', color: '#fff', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}
              >
                ✕
              </button>
            </div>
            <h4 style={{ color: '#fff', marginTop: '1rem', fontSize: '1.25rem', textShadow: '0 2px 10px rgba(0,0,0,0.9)', fontWeight: 600 }}>{viewingProject.title}</h4>
            <button className="btn btn-secondary" style={{ marginTop: '1rem', padding: '0.4rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setViewingProject(null)}>Close Viewer</button>
          </div>
        </div>
      )}
    </div>
  );
}
