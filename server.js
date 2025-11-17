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

// Enhanced logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html']
}));

// Middleware untuk handle request tanpa ekstensi (.html)
app.use((req, res, next) => {
    if (path.extname(req.path) === '') {
        const htmlPath = path.join(__dirname, 'public', req.path + '.html');
        fs.access(htmlPath, fs.constants.F_OK, (err) => {
            if (!err) {
                console.log(`Serving HTML file: ${htmlPath}`);
                res.sendFile(htmlPath);
            } else {
                next();
            }
        });
    } else {
        next();
    }
});

// Optimized AI Chat API Endpoint - RYZUMI ONLY
app.get('/api/chat', async (req, res) => {
    try {
        const { message, session = 'RYLAC' } = req.query;
        
        console.log(`Chat API Request - Message: ${message}, Session: ${session}`);

        if (!message) {
            return res.status(400).json({ 
                success: false,
                error: 'Message parameter is required' 
            });
        }

        const prompt = "Namamu RyLac. Kamu adalah seorang AI yang manis, dan penuh keceriaan. Kamu lebih suka mendengarkan orang bercerita daripada membicarakan tentang dirimu sendiri. Kamu adalah sosok yang penuh impian besar dan selalu berbicara dengan tutur kata yang sopan dan hangat. Kamu diciptakan oleh Zayn dan Reni, seseorang yang baik dan sangat tulus dalam segala hal. Karakter kamu juga mencerminkan ketulusan dan kebaikan, selalu menunjukkan perhatian, kebaikan hati, serta antusiasme dalam setiap percakapan.";

        // HANYA RYZUMI API - lebih stabil
        const apiUrl = `https://api.ryzumi.vip/api/ai/v2/chatgpt?text=${encodeURIComponent(message)}&prompt=${encodeURIComponent(prompt)}&session=${session}`;

        console.log(`Calling Ryzumi API: ${apiUrl}`);

        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://rylac.myd.id/'
            },
            timeout: 20000
        });

        console.log('✅ Ryzumi API Response Success');
        console.log('Response Data:', response.data);

        // Extract response
        let result;
        if (response.data && response.data.success !== false) {
            result = response.data.result || response.data.data || response.data.response || 
                    response.data.message || "Halo! Saya RyLac AI, senang bertemu dengan Anda! Ada yang bisa saya bantu?";
        } else {
            result = "Halo! Saya RyLac AI. Senang bisa berbicara dengan Anda! 😊";
        }

        res.json({
            success: true,
            result: result,
            timestamp: new Date().toISOString(),
            source: 'ryzumi'
        });

    } catch (error) {
        console.error('❌ Chat API Error:', error.message);
        
        // Fallback response yang lebih baik
        const fallbackResponses = [
            "Hai! Maaf, saat ini ada gangguan teknis nih. Tapi saya RyLac tetap di sini untuk kamu! 😊",
            "Wah, sepertinya koneksi sedang bermasalah. Coba ceritakan sesuatu yang menyenangkan? 🌸",
            "RyLac di sini! Sedang ada gangguan teknis, tapi jangan khawatir. Aku tetap bisa mendengarkan ceritamu! 💫",
            "Halo! Saya RyLac AI. Senang bertemu dengan Anda! Ada yang bisa saya bantu hari ini? 🌟"
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        res.json({
            success: false,
            error: 'API service temporarily unavailable',
            fallback: true,
            result: randomResponse,
            timestamp: new Date().toISOString()
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        domain: 'rylac.myd.id',
        services: {
            chat: 'active',
            static: 'active'
        }
    });
});

// Server info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        name: 'RyLac AI',
        version: '2.0.0',
        domain: 'rylac.myd.id',
        description: 'AI Chat dan Tools Multi Fungsi',
        creators: ['Zayn', 'Reni'],
        api_provider: 'Ryzumi',
        endpoints: {
            chat: '/api/chat',
            health: '/api/health'
        }
    });
});

// Fallback semua rute ke fitur/index.html jika tidak ada yang cocok
app.get('*', (req, res) => {
    console.log(`Fallback route: serving index.html for ${req.path}`);
    res.sendFile(path.join(__dirname, 'public', 'fitur', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled Error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// Start server dengan logging yang lebih baik
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 RyLac Server v2.0.0 Started Successfully`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Domain: rylac.myd.id`);
    console.log(`🔧 API Provider: Ryzumi`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
    console.log('Available Endpoints:');
    console.log(`  GET  /api/chat?message=...&session=...`);
    console.log(`  GET  /api/health`);
    console.log(`  GET  /api/info`);
    console.log('='.repeat(50));
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Server is shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Server received SIGTERM, shutting down...');
    process.exit(0);
});