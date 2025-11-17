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

// API Proxy Endpoint untuk Instagram Downloader
app.get('/api/instagram', async (req, res) => {
    try {
        const { url, type } = req.query;
        console.log(`Instagram API Request - URL: ${url}, Type: ${type}`);

        if (!url) {
            console.warn('Instagram API: URL parameter missing');
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        let apiUrl;
        if (type === 'story') {
            apiUrl = `https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`;
        } else {
            apiUrl = `https://api.siputzx.my.id/api/igdl?url=${encodeURIComponent(url)}`;
        }

        console.log(`Calling external API: ${apiUrl}`);

        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        });

        console.log('Instagram API Response Success');
        res.json(response.data);
    } catch (error) {
        console.error('Instagram API Error:', error.message);
        console.error('Error details:', error.response?.data || 'No response data');
        res.status(500).json({ 
            error: 'Failed to fetch Instagram data',
            details: error.message 
        });
    }
});

// NEW: Enhanced AI Chat API Endpoint with Multiple Fallbacks
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

        // Multiple API endpoints as fallback - UPDATED with working endpoints
        const apiEndpoints = [
            // Primary endpoints with different providers
            `https://api.azz.biz.id/api/openai?text=${encodeURIComponent(message)}&prompt=${encodeURIComponent(prompt)}`,
            `https://api.yanzbotz.my.id/api/gpt?prompt=${encodeURIComponent(prompt + " " + message)}`,
            `https://api.ibeng.tech/api/others/chatgpt?q=${encodeURIComponent(message)}`,
            
            // Secondary endpoints
            `https://api.ryzumi.vip/api/ai/v2/chatgpt?text=${encodeURIComponent(message)}&prompt=${encodeURIComponent(prompt)}&session=${session}`,
            `https://api.ryzumi.vip/api/ai/chatgpt?text=${encodeURIComponent(message)}&prompt=${encodeURIComponent(prompt)}`,
            `https://api.ryzumi.vip/api/gpt?text=${encodeURIComponent(message)}&prompt=${encodeURIComponent(prompt)}`
        ];

        let responseData = null;
        let lastError = null;

        // Try each endpoint until one works
        for (const endpoint of apiEndpoints) {
            try {
                console.log(`Trying AI endpoint: ${endpoint}`);
                const response = await axios.get(endpoint, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Referer': 'https://rylac-ai.vercel.app/'
                    },
                    timeout: 20000
                });

                console.log('API Response Status:', response.status);
                console.log('API Response Data:', response.data);

                // Handle different response formats
                if (response.data) {
                    if (response.data.result || response.data.data || response.data.response || response.data.message) {
                        responseData = response.data;
                        console.log('AI API Response Success from:', endpoint);
                        break;
                    } else if (typeof response.data === 'string' && response.data.length > 0) {
                        // If response is direct string
                        responseData = { result: response.data };
                        console.log('AI API Response Success (string response) from:', endpoint);
                        break;
                    }
                }
            } catch (error) {
                lastError = error;
                console.warn(`AI endpoint failed: ${endpoint} - ${error.message}`);
                if (error.response) {
                    console.warn(`Status: ${error.response.status}, Data:`, error.response.data);
                }
                continue;
            }
        }

        if (!responseData) {
            console.error('All AI endpoints failed');
            
            // Enhanced fallback responses based on message content
            let fallbackResponse = "Halo! Saya RyLac AI. Maaf, saat ini saya sedang mengalami gangguan teknis. Silakan coba lagi dalam beberapa saat ya! 😊";
            
            if (message.toLowerCase().includes('eror') || message.toLowerCase().includes('error')) {
                fallbackResponse = "Hai! Wah, aku paham banget rasanya kalau lagi mengalami error, pasti bikin frustrasi ya. Mungkin bisa aku bantu cari tahu penyebabnya? Kalau kamu mau, ceritakan sedikit tentang apa yang bikin error itu muncul, jadi aku bisa berusaha membantu mencari solusinya. Jangan khawatir, kita akan cari jalan keluarnya bersama-sama! 😊✨";
            } else if (message.toLowerCase().includes('kenapa')) {
                fallbackResponse = "Wah, ada yang ingin kamu ketahui ya? Aku RyLac di sini siap membantu! Coba ceritakan lebih detail apa yang mau kamu tanyakan, biar aku bisa kasih penjelasan yang tepat dan berguna untuk kamu. Jangan ragu untuk berbagi cerita! 🌸";
            }
            
            return res.json({
                success: false,
                error: 'All AI services are currently unavailable',
                fallback: true,
                result: fallbackResponse
            });
        }

        // Extract response from different possible field names
        const result = responseData.result || responseData.data || responseData.response || 
                      responseData.message || "Halo! Saya RyLac AI, senang bertemu dengan Anda! Ada yang bisa saya bantu?";
        
        res.json({
            success: true,
            result: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat API Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to process chat request',
            fallback: true,
            result: "Hai! Saya RyLac AI. Maaf, saat ini ada gangguan teknis nih. Tapi saya tetap di sini untuk kamu! Coba ceritakan sesuatu yang menyenangkan? 🌸"
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        services: {
            instagram: 'active',
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
        description: 'AI Chat dan Tools Multi Fungsi',
        creators: ['Zayn', 'Reni'],
        endpoints: {
            chat: '/api/chat',
            instagram: '/api/instagram',
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
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
    console.log('Available Endpoints:');
    console.log(`  GET  /api/chat?message=...&session=...`);
    console.log(`  GET  /api/instagram?url=...&type=...`);
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