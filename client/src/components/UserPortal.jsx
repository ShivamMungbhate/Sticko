import React, { useState, useEffect } from 'react';
import { 
  User, MapPin, Phone, Mail, FileText, 
  Calendar, CheckCircle, Clock, XCircle, ShieldCheck
} from 'lucide-react';

export default function UserPortal({ currentUser, onLogin, onLogout }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [bookings, setBookings] = useState([]);
  
  // Login input
  const [loginGovtId, setLoginGovtId] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regGovtId, setRegGovtId] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Fetch user bookings if logged in
  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  const fetchBookings = () => {
    fetch(`/api/bookings?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => setBookings(data.reverse())) // Show newest bookings first
      .catch(err => console.error('Error fetching bookings:', err));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ govtId: loginGovtId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          onLogin(data.user);
        } else {
          setLoginError(data.error || 'Authentication failed.');
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        setLoginError('Error connecting to authentication server.');
      });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess(false);

    const payload = {
      name: regName,
      mobile: regMobile,
      email: regEmail,
      address: regAddress,
      govtId: regGovtId
    };

    fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRegSuccess(true);
          setTimeout(() => {
            onLogin(data.user);
            setIsRegistering(false);
            // Reset form
            setRegName('');
            setRegMobile('');
            setRegEmail('');
            setRegAddress('');
            setRegGovtId('');
          }, 1500);
        } else {
          setRegError(data.error || 'Registration failed.');
        }
      })
      .catch(err => {
        console.error('Registration error:', err);
        setRegError('Error connecting to register server.');
      });
  };

  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        fetchBookings();
      })
      .catch(err => console.error('Error updating booking:', err));
  };

  // Login / Signup Form render
  if (!currentUser) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div className="card-glass" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
          
          {/* Header toggles */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => { setIsRegistering(false); setLoginError(''); }}
              style={{ flex: 1, background: 'none', border: 'none', color: !isRegistering ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsRegistering(true); setRegError(''); }}
              style={{ flex: 1, background: 'none', border: 'none', color: isRegistering ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Register (Hiring Person)
            </button>
          </div>

          {!isRegistering ? (
            /* LOGIN FORM (Gov ID serves as authentication ID) */
            <form onSubmit={handleLoginSubmit}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                Enter your Government ID to authenticate and access your bookings.
              </p>

              {loginError && <div style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{loginError}</div>}

              <div className="form-group">
                <label className="form-label">Government ID Number (User ID)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Aadhaar: 1234-5678-9012 or PAN"
                  className="form-input"
                  value={loginGovtId}
                  onChange={(e) => setLoginGovtId(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Authenticate Account
              </button>
            </form>
          ) : (
            /* REGISTER FORM (Requirement 5) */
            <form onSubmit={handleRegisterSubmit}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                Create a hiring account. Fill in details and authenticate with your Government ID.
              </p>

              {regError && <div style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{regError}</div>}
              {regSuccess && <div style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'center' }}>Account Registered Successfully! Logging you in...</div>}

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="John Doe"
                  className="form-input"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="9876543210"
                  className="form-input"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="john.doe@example.com"
                  className="form-input"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Home Address</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Sector 62, Noida, Uttar Pradesh"
                  className="form-input"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Government ID Number (Aadhaar/PAN/Passport)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Aadhaar: 1234-5678-9012"
                  className="form-input"
                  value={regGovtId}
                  onChange={(e) => setRegGovtId(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Register Profile
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Logged In Dashboard
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Hiring Portal Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your active jobs and verified contacts</p>
        </div>
        <button onClick={onLogout} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          Sign Out
        </button>
      </div>

      <div className="portal-layout">
        {/* User profile side pane */}
        <aside className="card-glass user-profile-summary" style={{ height: 'fit-content' }}>
          <div className="user-avatar-placeholder">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{currentUser.name}</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center', fontSize: '0.85rem', color: 'var(--success)', marginTop: '0.25rem' }}>
            <ShieldCheck size={14} /> Account Verified
          </div>

          <div className="user-meta-list">
            <div>
              <div className="user-meta-label">Mobile Number</div>
              <strong>+91 {currentUser.mobile}</strong>
            </div>
            <div>
              <div className="user-meta-label">Email Address</div>
              <strong>{currentUser.email}</strong>
            </div>
            <div>
              <div className="user-meta-label">Address</div>
              <strong>{currentUser.address}</strong>
            </div>
            <div>
              <div className="user-meta-label">Authenticated Govt ID</div>
              <strong style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>{currentUser.govtId}</strong>
            </div>
          </div>
        </aside>

        {/* Bookings log pane */}
        <main>
          <div className="card-glass">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              Your Booking Log
            </h3>

            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <Calendar size={36} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
                <p>No bookings made yet.</p>
              </div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="booking-worker-name">{booking.workerName}</span>
                      <span className="worker-category-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>{booking.workerCategory}</span>
                    </div>
                    
                    <div className="booking-details">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} /> {booking.date}
                      </span>
                      <span>
                        • {booking.hours} hours required
                      </span>
                    </div>
                    {booking.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '0.4rem 0.6rem', borderRadius: '4px', marginTop: '0.4rem', borderLeft: '2px solid var(--primary)' }}>
                        "{booking.notes}"
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700 }}>₹{booking.totalAmount}</span>
                      <span className={`booking-status ${booking.status}`}>{booking.status}</span>
                    </div>
                    
                    {/* Logged in customer can complete or cancel their bookings */}
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                          className="btn btn-danger" 
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        >
                          Cancel
                        </button>
                      )}
                      {booking.status === 'approved' && (
                        <>
                          <button 
                            onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                            className="btn btn-primary" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', background: 'var(--success)' }}
                          >
                            Mark Complete
                          </button>
                          <button 
                            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            className="btn btn-danger" 
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
