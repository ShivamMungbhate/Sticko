import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, Gamepad2, UserCheck, 
  Server, LogIn, LogOut, ChevronRight, Menu, X, ArrowRight
} from 'lucide-react';
import Home from './components/Home';
import CategoryList from './components/CategoryList';
import StudentCorner from './components/StudentCorner';
import WorkerRegister from './components/WorkerRegister';
import UserPortal from './components/UserPortal';
import AdminPanel from './components/AdminPanel';
import './App.css';
import OtpModal from './components/OtpModal';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchParams, setSearchParams] = useState({ query: '', location: '' });
  const [currentUser, setCurrentUser] = useState(null);
  
  // Mobile nav toggler
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fast Login Modal state
  const [promptLoginOpen, setPromptLoginOpen] = useState(false);
  const [fastGovtId, setFastGovtId] = useState('');
  const [fastLoginError, setFastLoginError] = useState('');

  const [theme, setTheme] = useState('default');
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpModalData, setOtpModalData] = useState({ phone: '', aadhaar: '', onComplete: null });

  // Persist User Session & Theme (Requirement)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    const savedTheme = localStorage.getItem('theme') || 'default';
    setTheme(savedTheme);
    document.body.className = `theme-${savedTheme}`;
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = `theme-${newTheme}`;
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    setActivePage('home');
  };

  const handleFastLoginSubmit = (e) => {
    e.preventDefault();
    setFastLoginError('');

    fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ govtId: fastGovtId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Trigger OTP Verification Modal first!
          setOtpModalData({
            phone: data.user.mobile,
            aadhaar: data.user.govtId.toLowerCase().includes('aadhaar') ? data.user.govtId : null,
            onComplete: () => {
              handleLogin(data.user);
              setPromptLoginOpen(false);
              setFastGovtId('');
            }
          });
          setOtpModalOpen(true);
        } else {
          setFastLoginError('Govt ID not found. Go to "Hiring Portal" to register.');
        }
      })
      .catch(() => setFastLoginError('Error connecting to auth server.'));
  };

  const navigateToPage = (pageName) => {
    setActivePage(pageName);
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Navbar Header */}
      <nav className="navbar">
        <div className="container nav-flex">
          <div className="logo-container" onClick={() => navigateToPage('home')}>
            📦 Sticko
          </div>

          {/* Links for Desktop */}
          <div className="nav-links" style={{ display: 'flex' }}>
            <span 
              className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
              onClick={() => navigateToPage('home')}
            >
              Home
            </span>
            <span 
              className={`nav-link ${activePage === 'category' ? 'active' : ''}`}
              onClick={() => { setSelectedCategory(null); setSearchParams({ query: '', location: '' }); navigateToPage('category'); }}
            >
              Hire Workers
            </span>
            <span 
              className={`nav-link student-btn ${activePage === 'student-corner' ? 'active' : ''}`}
              onClick={() => navigateToPage('student-corner')}
            >
              🎓 Student Corner
            </span>
            <span 
              className={`nav-link ${activePage === 'register-worker' ? 'active' : ''}`}
              onClick={() => navigateToPage('register-worker')}
            >
              Worker Register
            </span>
            
            <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }}></div>

            {currentUser ? (
              <span 
                className={`nav-link ${activePage === 'user-portal' ? 'active' : ''}`}
                onClick={() => navigateToPage('user-portal')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)' }}
              >
                <UserCheck size={16} /> Dashboard ({currentUser.name.split(' ')[0]})
              </span>
            ) : (
              <span 
                className={`nav-link ${activePage === 'user-portal' ? 'active' : ''}`}
                onClick={() => navigateToPage('user-portal')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <LogIn size={16} /> Hiring Portal
              </span>
            )}

            <span 
              className={`nav-link ${activePage === 'admin-panel' ? 'active' : ''}`}
              onClick={() => navigateToPage('admin-panel')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)' }}
            >
              <Server size={14} /> Server Control
            </span>

            {/* Theme Selector Widget */}
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
              <select 
                value={theme} 
                onChange={(e) => handleThemeChange(e.target.value)}
                className="form-select"
                style={{ 
                  padding: '0.25rem 0.5rem', 
                  fontSize: '0.8rem', 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-main)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: 'auto'
                }}
              >
                <option value="default">🎨 Default</option>
                <option value="dark">🌙 Dark</option>
                <option value="light">☀️ Light</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container View Switcher */}
      <main className="main-content">
        {activePage === 'home' && (
          <Home 
            onSelectCategory={(cat) => { setSelectedCategory(cat); navigateToPage('category'); }}
            onViewAllWorkers={() => navigateToPage('register-worker')}
            onSearch={(q, loc) => { setSearchParams({ query: q, location: loc }); setSelectedCategory(null); navigateToPage('category'); }}
          />
        )}
        
        {activePage === 'category' && (
          <CategoryList 
            category={selectedCategory} 
            currentUser={currentUser}
            onPromptLogin={() => setPromptLoginOpen(true)}
            searchParams={searchParams}
          />
        )}

        {activePage === 'student-corner' && (
          <StudentCorner 
            currentUser={currentUser}
            onPromptLogin={() => setPromptLoginOpen(true)}
            onSelectCategory={(cat) => { setSelectedCategory(cat); navigateToPage('category'); }}
          />
        )}

        {activePage === 'register-worker' && (
          <WorkerRegister 
            onRegistrationSuccess={() => { setSelectedCategory(null); navigateToPage('category'); }}
          />
        )}

        {activePage === 'user-portal' && (
          <UserPortal 
            currentUser={currentUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        )}

        {activePage === 'admin-panel' && (
          <AdminPanel />
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--glass-border)', 
        background: 'var(--bg-secondary)', 
        padding: '2.5rem 0', 
        fontSize: '0.9rem', 
        color: 'var(--text-muted)' 
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
              📦 Sticko Directory
            </div>
            <p>Premium local directory service database. Secure Govt ID Authentication.</p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              📞 Customer Care: <a href="mailto:shivamhuyrr@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>shivamhuyrr@gmail.com</a>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigateToPage('home')}>Home</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigateToPage('student-corner')}>Students Gigs</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigateToPage('admin-panel')}>Server Dashboard</span>
          </div>
          <div>
            © 2026 Sticko. Server password is root.
          </div>
        </div>
      </footer>

      {/* Prompt Login / Fast Authenticate Modal */}
      {promptLoginOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Hiring Verification Required</h3>
              <button className="close-btn" onClick={() => setPromptLoginOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleFastLoginSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  To hire workers, you must authenticate. Enter your Government ID as User ID, or sign up in the Hiring Portal first.
                </p>

                {fastLoginError && <div style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '1rem' }}>{fastLoginError}</div>}

                <div className="form-group">
                  <label className="form-label">Government ID (User ID)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Aadhaar: 0000-0000-0000"
                    className="form-input"
                    value={fastGovtId}
                    onChange={(e) => setFastGovtId(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span 
                  onClick={() => { setPromptLoginOpen(false); navigateToPage('user-portal'); }} 
                  style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  Create Account
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setPromptLoginOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Authenticate</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      <OtpModal 
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onSuccess={() => {
          setOtpModalOpen(false);
          if (otpModalData.onComplete) otpModalData.onComplete();
        }}
        targetPhone={otpModalData.phone}
        targetAadhaar={otpModalData.aadhaar}
      />
    </div>
  );
}
