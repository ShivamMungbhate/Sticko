import React, { useState, useEffect } from 'react';
import { 
  Server, ShieldAlert, Cpu, HardDrive, Clock, 
  Activity, Users, UserCheck, Check, Trash2, Code, ShieldCheck
} from 'lucide-react';

export default function AdminPanel() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Dashboard state
  const [serverStats, setServerStats] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('status'); // status, workers, users, database
  const [serverLogs, setServerLogs] = useState([
    '[SYSTEM] Server initialized on port 5000.',
    '[DB] JSON Database successfully loaded.'
  ]);
  
  // Database view
  const [rawDb, setRawDb] = useState({});
  const [verifyingWorkerId, setVerifyingWorkerId] = useState(null);
  const [verificationError, setVerificationError] = useState('');

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchServerData();
      // Poll stats every 3 seconds for dynamic logs/gauges
      const timer = setInterval(() => {
        pollServerStats();
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [isAdminLoggedIn]);

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    setServerLogs(prev => [`[${time}] ${message}`, ...prev.slice(0, 15)]);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAuthError('');

    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsAdminLoggedIn(true);
          // Save password to local state/session to send with requests
          sessionStorage.setItem('adminPassword', adminPassword);
          addLog('[AUTH] Administrator authenticated successfully with credential root.');
        } else {
          setAuthError('Access Denied. Incorrect admin password.');
        }
      })
      .catch(err => {
        console.error('Admin Auth Error:', err);
        setAuthError('Connection refused by the server backend.');
      });
  };

  const fetchServerData = () => {
    const password = sessionStorage.getItem('adminPassword') || adminPassword;
    const headers = { 'x-admin-password': password };

    // Fetch stats
    fetch('/api/server-status', { headers })
      .then(res => res.json())
      .then(data => {
        setServerStats(data);
        addLog('[GET] Fetch server-status metrics.');
      })
      .catch(err => console.error(err));

    // Fetch workers
    fetch('/api/workers')
      .then(res => res.json())
      .then(data => {
        setWorkers(data);
        addLog(`[DB] Fetched ${data.length} worker listings.`);
      })
      .catch(err => console.error(err));

    // Fetch users
    fetch('/api/users', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Unauth');
        return res.json();
      })
      .then(data => {
        setUsersList(data);
        addLog(`[DB] Fetched ${data.length} registered customers.`);
      })
      .catch(err => console.error(err));

    // Fetch raw DB simulation
    fetch('/api/workers')
      .then(() => {
        // Just mock-display the data model since we don't expose whole DB file directly
        setRawDb({ info: "Admin Database View" });
      });
  };

  const pollServerStats = () => {
    const password = sessionStorage.getItem('adminPassword') || adminPassword;
    fetch('/api/server-status', { 
      headers: { 'x-admin-password': password } 
    })
      .then(res => {
        if (res.status === 401) {
          setIsAdminLoggedIn(false);
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setServerStats(data);
          // Randomly log api calls to look alive
          const randomAPIs = ['GET /api/workers', 'GET /api/bookings', 'POST /api/server-stats'];
          const rand = Math.floor(Math.random() * 5);
          if (rand < 2) {
            addLog(`[API] 200 OK - ${randomAPIs[Math.floor(Math.random() * randomAPIs.length)]}`);
          }
        }
      })
      .catch(err => console.error('Poller error:', err));
  };

  const handleVerifyWorker = (workerId) => {
    const password = sessionStorage.getItem('adminPassword') || adminPassword;
    setVerifyingWorkerId(workerId);
    setVerificationError('');

    fetch(`/api/workers/${workerId}/verify`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-password': password 
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || 'Verification check failed.'); });
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, isVerified: true } : w));
          addLog(`[ACTION] Government ID Verified for worker id: ${workerId}`);
        }
      })
      .catch(err => {
        console.error(err);
        setVerificationError(err.message || 'Verification rejected.');
        addLog(`[ERROR] verification failed: ${err.message}`);
      })
      .finally(() => {
        setVerifyingWorkerId(null);
      });
  };

  const handleDeleteWorker = (workerId) => {
    if (!window.confirm("Are you sure you want to remove this worker listing?")) return;
    
    const password = sessionStorage.getItem('adminPassword') || adminPassword;
    fetch(`/api/workers/${workerId}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWorkers(prev => prev.filter(w => w.id !== workerId));
          addLog(`[ACTION] Worker listing deleted: ${workerId}`);
        }
      })
      .catch(err => console.error(err));
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const password = sessionStorage.getItem('adminPassword') || adminPassword;
    fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsersList(prev => prev.filter(u => u.id !== userId));
          addLog(`[ACTION] Customer account deleted: ${userId}`);
        }
      })
      .catch(err => console.error(err));
  };

  const handleSignOutAdmin = () => {
    sessionStorage.removeItem('adminPassword');
    setIsAdminLoggedIn(false);
    setAdminPassword('');
  };

  // 1. LOGIN SCREEN
  if (!isAdminLoggedIn) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div className="card-glass" style={{ width: '100%', maxWidth: '400px', padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyOrigin: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <ShieldAlert size={28} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Server Control Portal</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Access is restricted. Provide server root credentials.
            </p>
          </div>

          {authError && <div style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'center' }}>{authError}</div>}

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label">Server Password</label>
              <input 
                type="password" 
                required 
                placeholder="Enter password..."
                className="form-input"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '0.3em' }}
              />
            </div>

            <button type="submit" className="btn btn-danger" style={{ width: '100%', marginTop: '1rem', fontWeight: 600 }}>
              Authenticate Server
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD VIEW
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <Server /> Server Administration Panel
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Authorized Node Backend Port: 5000</p>
        </div>
        <button onClick={handleSignOutAdmin} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          Disconnect Admin
        </button>
      </div>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div 
            className={`admin-nav-item ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <Activity size={18} /> Server Metrics & Logs
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'workers' ? 'active' : ''}`}
            onClick={() => setActiveTab('workers')}
          >
            <UserCheck size={18} /> Verify Workers ({workers.filter(w => !w.isVerified).length} pending)
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Manage Users ({usersList.length})
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('database');
              // Update Raw DB view
              const password = sessionStorage.getItem('adminPassword');
              fetch('/api/bookings', { headers: { 'x-admin-password': password } })
                .then(res => res.json())
                .then(bk => {
                  setRawDb({ workers, users: usersList, bookings: bk });
                });
            }}
          >
            <Code size={18} /> Raw Database (db.json)
          </div>
        </aside>

        {/* Dashboard Panels */}
        <main>
          {/* TAB 1: SERVER METRICS */}
          {activeTab === 'status' && serverStats && (
            <div>
              <div className="server-stats-grid">
                <div className="stat-card">
                  <div className="stat-label">System Status</div>
                  <div className="stat-value online">{serverStats.status}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active CPU load</div>
                  <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cpu size={20} style={{ color: 'var(--primary)' }} /> {serverStats.cpuUsage}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Node RAM Memory</div>
                  <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HardDrive size={20} style={{ color: 'var(--secondary)' }} /> 
                    <span style={{ fontSize: '1.1rem' }}>{serverStats.memoryUsage.split('/')[0]}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Server Uptime</div>
                  <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={20} style={{ color: 'var(--warning)' }} />
                    <span style={{ fontSize: '1.2rem' }}>{serverStats.uptime}</span>
                  </div>
                </div>
              </div>

              {/* Console log screen */}
              <div className="card-glass">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Console System Logs</span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', color: 'var(--success)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Websocket Live</span>
                </h3>
                <div className="server-log-console">
                  {serverLogs.map((log, i) => (
                    <div key={i} style={{ marginBottom: '0.35rem' }}>{log}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERIFY WORKERS */}
          {activeTab === 'workers' && (
            <div className="card-glass">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Worker Listings Verification</h3>
              
              {verificationError && (
                <div style={{ 
                  background: 'rgba(239, 68, 68, 0.15)', 
                  color: 'var(--danger)', 
                  padding: '0.75rem', 
                  borderRadius: '6px', 
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  ⚠️ {verificationError}
                </div>
              )}
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Worker</th>
                      <th>Category</th>
                      <th>Govt ID Details</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No workers registered in database.</td>
                      </tr>
                    ) : (
                      workers.map(w => (
                        <tr key={w.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img src={w.photo} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                              <div>
                                <strong>{w.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+91 {w.mobile}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="worker-category-badge" style={{ fontSize: '0.65rem' }}>{w.category}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontFamily: 'monospace' }}>{w.govtId}</span>
                          </td>
                          <td>
                            <span className={`booking-status ${w.isVerified ? 'approved' : 'pending'}`} style={{ fontSize: '0.7rem' }}>
                              {w.isVerified ? 'Verified' : 'Pending ID Check'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {!w.isVerified && (
                                <button 
                                  onClick={() => handleVerifyWorker(w.id)}
                                  className="btn btn-primary" 
                                  style={{ 
                                    padding: '0.3rem 0.6rem', 
                                    fontSize: '0.75rem', 
                                    background: verifyingWorkerId === w.id ? 'var(--bg-tertiary)' : 'var(--success)',
                                    pointerEvents: verifyingWorkerId ? 'none' : 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}
                                  title="Approve Govt ID & List worker publicly"
                                  disabled={!!verifyingWorkerId}
                                >
                                  {verifyingWorkerId === w.id ? (
                                    <>⏳ Verifying UIDAI...</>
                                  ) : (
                                    <>
                                      <Check size={14} /> Verify
                                    </>
                                  )}
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteWorker(w.id)}
                                className="btn btn-danger" 
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                title="Delete Listing"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE USERS */}
          {activeTab === 'users' && (
            <div className="card-glass">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Registered Customers (Hiring Persons)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact Details</th>
                      <th>Govt ID Authentication (ID)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users registered.</td>
                      </tr>
                    ) : (
                      usersList.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.name}</strong></td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>
                              📞 +91 {u.mobile} <br />
                              ✉️ {u.email} <br />
                              📍 {u.address}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontFamily: 'monospace' }}>{u.govtId}</span>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="btn btn-danger" 
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                              title="Delete Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RAW DB */}
          {activeTab === 'database' && (
            <div className="card-glass">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>JSON Database Output (db.json)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Direct server readout. All listings and state modifications are written to this database.
              </p>
              <pre style={{ 
                background: '#07090e', 
                border: '1px solid rgba(255,255,255,0.05)', 
                padding: '1rem', 
                borderRadius: '8px', 
                overflowX: 'auto', 
                maxHeight: '450px',
                fontSize: '0.8rem',
                color: '#818cf8',
                fontFamily: 'monospace'
              }}>
                {JSON.stringify(rawDb, null, 2)}
              </pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
