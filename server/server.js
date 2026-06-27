const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Helper to read database
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB, resetting to defaults', error);
    return { workers: [], users: [], bookings: [], studentGigs: [] };
  }
}

// Helper to write database
async function writeDB(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing DB', error);
  }
}

// Middleware to check Admin password
function adminAuth(req, res, next) {
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword === 'root') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Server access restricted. Admin password incorrect.' });
  }
}

// --- API ROUTES ---

// 1. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'root') {
    res.json({ success: true, message: 'Server Authentication Successful.' });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect server password.' });
  }
});

// 2. Server Status (Mock metrics for Admin Panel)
app.get('/api/server-status', adminAuth, async (req, res) => {
  const db = await readDB();
  const uptime = process.uptime();
  // Mock some changing CPU/RAM metrics
  const cpuUsage = (Math.random() * 20 + 10).toFixed(1);
  const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  
  res.json({
    status: 'ONLINE',
    port: PORT,
    databaseSize: `${(JSON.stringify(db).length / 1024).toFixed(2)} KB`,
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    cpuUsage: `${cpuUsage}%`,
    memoryUsage: `${memoryUsage} MB / 512 MB Limit`,
    activeSessions: db.users.length + 1,
    workerCount: db.workers.length,
    userCount: db.users.length,
    bookingCount: db.bookings.length
  });
});

// 3. Workers Endpoints
app.get('/api/workers', async (req, res) => {
  const db = await readDB();
  const { category, search } = req.query;
  let results = db.workers;

  if (category) {
    results = results.filter(w => w.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(w => 
      w.name.toLowerCase().includes(q) || 
      w.category.toLowerCase().includes(q) ||
      w.address.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

// Register worker (Updatable by UI)
app.post('/api/workers', async (req, res) => {
  const db = await readDB();
  const { name, category, mobile, email, address, govtId, photo, experience, hourlyRate, games, studentSection } = req.body;

  if (!name || !category || !mobile || !email || !address || !govtId) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const newWorker = {
    id: 'w' + (Date.now()),
    name,
    category,
    mobile,
    email,
    address,
    govtId,
    isVerified: false, // Must be verified by Admin with password 'root'
    photo: photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    rating: 5.0,
    experience: experience || '1 year',
    hourlyRate: Number(hourlyRate) || 150,
    games: games || [],
    studentSection: studentSection || false,
    reviews: []
  };

  db.workers.push(newWorker);
  await writeDB(db);
  res.status(201).json(newWorker);
});

// Verify Worker Govt ID (Admin only)
app.put('/api/workers/:id/verify', adminAuth, async (req, res) => {
  const db = await readDB();
  const worker = db.workers.find(w => w.id === req.params.id);
  if (!worker) {
    return res.status(404).json({ error: 'Worker not found.' });
  }

  worker.isVerified = true;
  await writeDB(db);
  res.json({ success: true, worker });
});

// Update/Edit Worker profile
app.put('/api/workers/:id', async (req, res) => {
  const db = await readDB();
  const index = db.workers.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Worker not found.' });
  }

  db.workers[index] = { ...db.workers[index], ...req.body };
  await writeDB(db);
  res.json({ success: true, worker: db.workers[index] });
});

// Delete Worker (Admin only)
app.delete('/api/workers/:id', adminAuth, async (req, res) => {
  const db = await readDB();
  const index = db.workers.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Worker not found.' });
  }

  db.workers.splice(index, 1);
  await writeDB(db);
  res.json({ success: true, message: 'Worker removed.' });
});

// 4. Users Endpoints
app.post('/api/users/login', async (req, res) => {
  const db = await readDB();
  const { govtId } = req.body;
  if (!govtId) {
    return res.status(400).json({ error: 'Government ID is required for authentication.' });
  }

  const user = db.users.find(u => u.govtId.trim().toLowerCase() === govtId.trim().toLowerCase());
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(404).json({ success: false, error: 'User ID (Govt ID) not registered.' });
  }
});

app.post('/api/users/register', async (req, res) => {
  const db = await readDB();
  const { name, mobile, email, address, govtId } = req.body;

  if (!name || !mobile || !email || !address || !govtId) {
    return res.status(400).json({ error: 'All fields (Name, Mobile, Email, Address, Govt ID) are required.' });
  }

  // Check if user already exists
  const existing = db.users.find(u => u.govtId.trim().toLowerCase() === govtId.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'A user with this Government ID already exists.' });
  }

  const newUser = {
    id: 'u' + (Date.now()),
    name,
    mobile,
    email,
    address,
    govtId
  };

  db.users.push(newUser);
  await writeDB(db);
  res.status(201).json({ success: true, user: newUser });
});

// Get all users (Admin only)
app.get('/api/users', adminAuth, async (req, res) => {
  const db = await readDB();
  res.json(db.users);
});

// Delete user (Admin only)
app.delete('/api/users/:id', adminAuth, async (req, res) => {
  const db = await readDB();
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }
  db.users.splice(index, 1);
  await writeDB(db);
  res.json({ success: true, message: 'User removed.' });
});

// 5. Bookings Endpoints
app.get('/api/bookings', async (req, res) => {
  const db = await readDB();
  const { userId } = req.query;
  const adminPassword = req.headers['x-admin-password'];

  if (adminPassword === 'root') {
    return res.json(db.bookings);
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required to fetch bookings.' });
  }

  const userBookings = db.bookings.filter(b => b.userId === userId);
  res.json(userBookings);
});

app.post('/api/bookings', async (req, res) => {
  const db = await readDB();
  const { userId, userName, workerId, workerName, workerCategory, date, hours, notes } = req.body;

  if (!userId || !workerId || !date || !hours) {
    return res.status(400).json({ error: 'Required booking details missing.' });
  }

  const worker = db.workers.find(w => w.id === workerId);
  const totalAmount = (worker ? worker.hourlyRate : 150) * Number(hours);

  const newBooking = {
    id: 'b' + (Date.now()),
    userId,
    userName: userName || 'Customer',
    workerId,
    workerName: workerName || (worker ? worker.name : 'Worker'),
    workerCategory: workerCategory || (worker ? worker.category : 'General'),
    date,
    status: 'pending', // pending, approved, completed, cancelled
    hours: Number(hours),
    totalAmount,
    notes: notes || ''
  };

  db.bookings.push(newBooking);
  await writeDB(db);
  res.status(201).json(newBooking);
});

// Update Booking Status
app.put('/api/bookings/:id', async (req, res) => {
  const db = await readDB();
  const { status } = req.body; // approved, completed, cancelled
  const booking = db.bookings.find(b => b.id === req.params.id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  booking.status = status;
  await writeDB(db);
  res.json({ success: true, booking });
});

// Add review to a worker after completion
app.post('/api/workers/:id/reviews', async (req, res) => {
  const db = await readDB();
  const worker = db.workers.find(w => w.id === req.params.id);
  if (!worker) {
    return res.status(404).json({ error: 'Worker not found.' });
  }

  const { user, rating, comment } = req.body;
  if (!user || !rating) {
    return res.status(400).json({ error: 'User name and rating are required.' });
  }

  const newReview = {
    user,
    rating: Number(rating),
    comment: comment || '',
    date: new Date().toISOString().split('T')[0]
  };

  worker.reviews.push(newReview);
  // Recalculate average rating
  const totalRating = worker.reviews.reduce((acc, curr) => acc + curr.rating, 0);
  worker.rating = Number((totalRating / worker.reviews.length).toFixed(1));

  await writeDB(db);
  res.status(201).json({ success: true, worker });
});

// 6. Student Gigs Endpoints
app.get('/api/gigs', async (req, res) => {
  const db = await readDB();
  res.json(db.studentGigs);
});

app.post('/api/gigs', async (req, res) => {
  const db = await readDB();
  const { title, description, company, salary, type, location } = req.body;

  if (!title || !description || !salary) {
    return res.status(400).json({ error: 'Title, description, and salary are required.' });
  }

  const newGig = {
    id: 'g' + (Date.now()),
    title,
    description,
    company: company || 'Local Business',
    salary,
    type: type || 'Part-Time',
    location: location || 'Remote'
  };

  db.studentGigs.push(newGig);
  await writeDB(db);
  res.status(201).json(newGig);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running on http://127.0.0.1:${PORT}`);
});
