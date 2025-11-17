require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'] // Tambahkan .html jika tidak ditemukan
}));

// Middleware untuk handle request tanpa ekstensi (.html)
app.use((req, res, next) => {
  if (path.extname(req.path) === '') {
    const htmlPath = path.join(__dirname, 'public', req.path + '.html');
    fs.access(htmlPath, fs.constants.F_OK, (err) => {
      if (!err) {
        res.sendFile(htmlPath);
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

// API Proxy Endpoint untuk Instagram Downloader
app.get('/api/instagram', async (req, res) => {
  try {
    const { url, type } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    let apiUrl;
    if (type === 'story') {
      apiUrl = `https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`;
    } else {
      apiUrl = `https://api.siputzx.my.id/api/igdl?url=${encodeURIComponent(url)}`;
    }

    const response = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch Instagram data' });
  }
});

// Fallback semua rute ke fitur/index.html jika tidak ada yang cocok
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fitur', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});