const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'] // Ini akan mencoba menambahkan .html jika file tidak ditemukan
}));

// Middleware khusus untuk menangani permintaan tanpa ekstensi .html
app.use((req, res, next) => {
  if (path.extname(req.path) === '') {
    const htmlPath = path.join(__dirname, 'public', req.path + '.html');
    
    fs.access(htmlPath, fs.constants.F_OK, (err) => {
      if (!err) {
        res.sendFile(htmlPath);
      } else {
        // Jika file HTML tidak ditemukan, lanjutkan ke handler berikutnya
        next();
      }
    });
  } else {
    next();
  }
});

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});