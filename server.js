require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const { track } = require("@vercel/analytics/server");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Server-side tracking (Vercel Analytics)
app.use((req, res, next) => {
    try {
        track("page_view", { url: req.url });
    } catch {}
    next();
});

// Logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

// Static /public
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html']
}));

// Handle /page -> /page.html
app.use((req, res, next) => {
    if (path.extname(req.path) === '') {
        const htmlPath = path.join(__dirname, 'public', req.path + '.html');
        fs.access(htmlPath, fs.constants.F_OK, (err) => {
            if (!err) return res.sendFile(htmlPath);
            next();
        });
    } else next();
});

// Instagram Downloader API
app.get('/api/instagram', async (req, res) => {
    try {
        const { url, type } = req.query;
        if (!url) return res.status(400).json({ error: 'URL parameter is required' });

        let apiUrl =
            type === 'story'
                ? `https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`
                : `https://api.siputzx.my.id/api/igdl?url=${encodeURIComponent(url)}`;

        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Instagram data' });
    }
});

// AI Chat API
app.get('/api/chat', async (req, res) => {
    try {
        const { message, session = 'RYLAC' } = req.query;
        if (!message) return res.status(400).json({ error: "Message is required" });

        const prompt =
            "Namamu RyLac. Kamu adalah AI yang ceria, manis, lembut, dan penuh perhatian...";

        const endpoints = [
            `https://api.ryzumi.vip/api/ai/v2/chatgpt?text=${encodeURIComponent(message)}&prompt=${encodeURIComponent(prompt)}&session=${session}`,
            `https://api.ryzumi.vip/api/ai/chatgpt?text=${encodeURIComponent(message)}&prompt=${encodeURIComponent(prompt)}`,
            `https://api.ryzumi.vip/api/gpt?text=${encodeURIComponent(message)}&prompt=${encodeURIComponent(prompt)}`
        ];

        let result = null;

        for (let url of endpoints) {
            try {
                let r = await axios.get(url);
                result = r.data.result || r.data.data || r.data.response;
                if (result) break;
            } catch {}
        }

        if (!result)
            return res.json({
                success: false,
                fallback: true,
                result: "RyLac lagi error sayang 😭 coba lagi nanti yaa 💕"
            });

        res.json({ success: true, result });
    } catch {
        res.json({
            success: false,
            fallback: true,
            result: "Lagi gangguan sayang 🤍 coba lagi ya"
        });
    }
});

// Info
app.get('/api/info', (req, res) => {
    res.json({
        name: "RyLac AI",
        version: "2.0.0",
        status: "online"
    });
});

// Health
app.get('/api/health', (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Fallback → fitur/index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "fitur", "index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 RyLac server running on port ${PORT}`);
});