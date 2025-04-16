const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Config
const JWT_SECRET = "egunkari-premium-secret-2023";
const PORT = process.env.PORT || 3000;

// In-memory database (replace with real database in production)
let users = [];
let notes = [];

// Helper functions
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
};

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.send('Catatan Online API');
});

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      avatar: 0
    };

    users.push(user);

    // Generate token
    const token = generateToken(user);

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ error: 'Gagal melakukan registrasi' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Email atau password salah' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Email atau password salah' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ error: 'Gagal melakukan login' });
  }
});

// Note Routes
app.get('/api/notes', authenticateToken, (req, res) => {
  try {
    const userNotes = notes.filter(note => 
      note.userId === req.user.id || note.public === true
    );
    res.json(userNotes);
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat catatan' });
  }
});

app.post('/api/notes', authenticateToken, (req, res) => {
  try {
    const { title, content, tags, isPublic } = req.body;
    
    const note = {
      id: uuidv4(),
      title,
      content,
      tags,
      public: isPublic,
      userId: req.user.id,
      createdAt: new Date().toISOString()
    };

    notes.push(note);
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Gagal menyimpan catatan' });
  }
});

app.put('/api/notes/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, isPublic } = req.body;
    
    const noteIndex = notes.findIndex(n => n.id === id && n.userId === req.user.id);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }

    notes[noteIndex] = {
      ...notes[noteIndex],
      title,
      content,
      tags,
      public: isPublic,
      updatedAt: new Date().toISOString()
    };

    res.json(notes[noteIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui catatan' });
  }
});

app.delete('/api/notes/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const noteIndex = notes.findIndex(n => n.id === id && n.userId === req.user.id);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }

    notes.splice(noteIndex, 1);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus catatan' });
  }
});

// Profile Routes
app.get('/api/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    res.json({ 
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat profil' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    // Check if email is already taken by another user
    if (users.some(u => u.email === email && u.id !== req.user.id)) {
      return res.status(400).json({ error: 'Email sudah digunakan' });
    }

    const updateData = {
      name,
      email,
      avatar
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateData
    };

    res.json({ 
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      avatar: users[userIndex].avatar
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui profil' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});