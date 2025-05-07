// config.js
const RyLacConfig = {
    // App Information
    appName: "RyLac AI Chat",
    appDescription: "Asisten cerdas multi-fungsi yang siap membantu berbagai kebutuhan Anda",
    appLogo: "https://files.catbox.moe/zj48ha.jpg",
    appWallpaper: "https://files.catbox.moe/ie1cd5.jpg",
    appVersion: "1.0",
    appAuthors: "Zayn dan Reni",
    
    // Social Media Links
    socialLinks: [
        { icon: "fab fa-tiktok", url: "https://tiktok.com" },
        { icon: "fab fa-youtube", url: "https://youtube.com" },
        { icon: "fab fa-instagram", url: "https://instagram.com" }
    ],
    
// Tools Configuration
tools: [
    {
        id: "igdl",
        name: "Instagram Downloader",
        icon: "fab fa-instagram",
        url: "igdl.html"
    },
    {
        id: "twitdl",
        name: "Twitter Downloader", 
        icon: "fab fa-twitter",
        url: "twitdl.html"
    },
    {
        id: "tiktok",
        name: "TikTok Downloader",
        icon: "fab fa-tiktok",
        url: "tiktok.html"
    },
    {
        id: "youtube",
        name: "YouTube Downloader",
        icon: "fab fa-youtube",
        url: "ytb.html"
    },
    // Coming Soon Items
    {
        id: "stikerbrat",
        name: "Sticker Brat",
        icon: "fas fa-sticky-note",
        url: "brat.html"
    },
    {
        id: "stikerquote",
        name: "Sticker Quote",
        icon: "fas fa-quote-right",
        url: "qc.html"
    },
    {
        id: "nimmahasiswa",
        name: "NIM Siswa",
        icon: "fas fa-id-card",
        url: "ceknim.html"
    },
    {
        id: "upscaler",
        name: "Upscaler Foto",
        icon: "fas fa-expand-arrows-alt",
        url: "upscaler.html"
    },
    {
        id: "toanime",
        name: "Image To Anime",
        icon: "fas fa-magic",
        url: "toanime.html"
    }
],
    
    // Default Settings
    defaultSettings: {
        darkMode: false,
        wallpaperOpacity: 10,
        typingEffect: true
    }
};