// Language translations
const translations = {
  en: {
    title: "Instagram Downloader",
    subtitle: "Download Instagram photos, videos, and stories",
    placeholder: "Paste Instagram URL here...",
    downloadBtn: "Download",
    pasteBtn: "Paste",
    loading: "Processing...",
    error: "Failed to fetch media. Please check the URL.",
    description: "Caption",
    author: "Author",
    comments: "Comments",
    duration: "Duration",
    footer: "© 2023 RyLac Instagram Downloader. All rights reserved.",
    videoBtn: "Download Video",
    photoBtn: "Download Photo",
    audioBtn: "Download Audio",
    storyBtn: "Download Story",
    noDescription: "No caption available",
    tabPost: "Post",
    tabStory: "Story"
  },
  id: {
    title: "Pengunduh Instagram",
    subtitle: "Unduh foto, video, dan story Instagram",
    placeholder: "Tempel URL Instagram di sini...",
    downloadBtn: "Unduh",
    pasteBtn: "Tempel",
    loading: "Memproses...",
    error: "Gagal mengambil media. Silakan periksa URL.",
    description: "Keterangan",
    author: "Pembuat",
    comments: "Komentar",
    duration: "Durasi",
    footer: "© 2023 RyLac Pengunduh Instagram. Hak cipta dilindungi.",
    videoBtn: "Unduh Video",
    photoBtn: "Unduh Foto",
    audioBtn: "Unduh Audio",
    storyBtn: "Unduh Story",
    noDescription: "Tidak ada keterangan",
    tabPost: "Postingan",
    tabStory: "Story"
  }
};

// Current language and content type
let currentLang = 'en';
let contentType = 'post';

// DOM elements
const langEnBtn = document.getElementById('lang-en');
const langIdBtn = document.getElementById('lang-id');
const tabPostBtn = document.getElementById('tab-post');
const tabStoryBtn = document.getElementById('tab-story');
const tabPostText = document.getElementById('tab-post-text');
const tabStoryText = document.getElementById('tab-story-text');
const igUrlInput = document.getElementById('igUrl');
const downloadBtnText = document.getElementById('download-btn-text');
const pasteBtnText = document.getElementById('paste-btn-text');
const subtitle = document.getElementById('subtitle');
const loadingText = document.getElementById('loading-text');
const errorText = document.getElementById('error-text');
const descriptionLabel = document.getElementById('description-label');
const authorLabel = document.getElementById('author-label');
const commentsLabel = document.getElementById('comments-label');
const durationLabel = document.getElementById('duration-label');
const footerText = document.getElementById('footer-text');

// Switch language
function switchLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  
  // Update UI elements
  document.querySelector('h1').textContent = t.title;
  subtitle.textContent = t.subtitle;
  igUrlInput.placeholder = t.placeholder;
  downloadBtnText.textContent = t.downloadBtn;
  pasteBtnText.textContent = t.pasteBtn;
  loadingText.textContent = t.loading;
  errorText.textContent = t.error;
  descriptionLabel.textContent = t.description;
  authorLabel.textContent = t.author;
  commentsLabel.textContent = t.comments;
  durationLabel.textContent = t.duration;
  footerText.textContent = t.footer;
  tabPostText.textContent = t.tabPost;
  tabStoryText.textContent = t.tabStory;
  
  // Update active language button
  if (lang === 'en') {
    langEnBtn.classList.add('active');
    langIdBtn.classList.remove('active');
  } else {
    langEnBtn.classList.remove('active');
    langIdBtn.classList.add('active');
  }
}

// Switch content type
function switchContentType(type) {
  contentType = type;
  if (type === 'post') {
    tabPostBtn.classList.add('active');
    tabStoryBtn.classList.remove('active');
  } else {
    tabPostBtn.classList.remove('active');
    tabStoryBtn.classList.add('active');
  }
}

// Event listeners for language buttons
langEnBtn.addEventListener('click', () => switchLanguage('en'));
langIdBtn.addEventListener('click', () => switchLanguage('id'));

// Event listeners for tab buttons
tabPostBtn.addEventListener('click', () => switchContentType('post'));
tabStoryBtn.addEventListener('click', () => switchContentType('story'));

// Paste from clipboard
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    igUrlInput.value = text;
  } catch (err) {
    alert(currentLang === 'en' ? 
      "Failed to paste from clipboard. Please paste manually." : 
      "Gagal menempel dari clipboard. Silakan tempel manual.");
  }
}

// Show loading state
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('error').style.display = 'none';
  document.getElementById('result').style.display = 'none';
}

// Show error state
function showError() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error').style.display = 'block';
  document.getElementById('result').style.display = 'none';
}

// Show result
function showResult() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error').style.display = 'none';
  document.getElementById('result').style.display = 'block';
}

// Download Instagram media
async function downloadIG() {
  const url = igUrlInput.value.trim();
  
  if (!url) {
    alert(currentLang === 'en' ? 
      "Please enter an Instagram URL first" : 
      "Silakan masukkan URL Instagram terlebih dahulu");
    return;
  }
  
  showLoading();
  
  try {
    const response = await fetch(`/api/instagram?url=${encodeURIComponent(url)}&type=${contentType}`);
    const json = await response.json();
    
    if (!json.status) {
      throw new Error('API request failed');
    }
    
    const data = json.BK9;
    const t = translations[currentLang];
    
    // Update media preview
    const mediaPreview = document.getElementById('media-preview');
    mediaPreview.innerHTML = '';
    
    if (contentType === 'post') {
      // Handle posts (photos/videos)
      const videoFormat = data.formats.find(f => f.type === 'video');
      const photoFormats = data.formats.filter(f => f.type === 'image');
      const audioFormat = data.formats.find(f => f.type === 'audio');
      
      if (videoFormat) {
        mediaPreview.innerHTML = `<video controls src="${videoFormat.url}" poster="${data.thumbnail}"></video>`;
        document.getElementById('duration-container').style.display = 'flex';
        document.getElementById('duration-text').textContent = data.duration;
      } else if (photoFormats.length > 0) {
        photoFormats.forEach(photo => {
          mediaPreview.innerHTML += `<img src="${photo.url}" loading="lazy">`;
        });
        document.getElementById('duration-container').style.display = 'none';
      }
      
      if (audioFormat) {
        mediaPreview.innerHTML += `<audio controls src="${audioFormat.url}"></audio>`;
      }
      
      // Update metadata
      document.getElementById('description-text').textContent = data.title || t.noDescription;
      document.getElementById('author-text').textContent = data.author || 'Unknown';
      document.getElementById('like-count').textContent = data.likes ? data.likes.toLocaleString() : 'N/A';
      document.getElementById('comment-count').textContent = data.comments ? data.comments.toLocaleString() : 'N/A';
      
      // Update download buttons
      const downloadsContainer = document.getElementById('downloads');
      downloadsContainer.innerHTML = '';
      
      if (videoFormat) {
        downloadsContainer.innerHTML += `
          <a href="${videoFormat.url}" download class="download-btn video">
            <i class="fas fa-video"></i> ${t.videoBtn}
          </a>`;
      }
      
      if (photoFormats.length > 0) {
        photoFormats.forEach((photo, i) => {
          downloadsContainer.innerHTML += `
            <a href="${photo.url}" download class="download-btn photo">
              <i class="fas fa-image"></i> ${t.photoBtn} ${photoFormats.length > 1 ? i + 1 : ''}
            </a>`;
        });
      }
      
      if (audioFormat) {
        downloadsContainer.innerHTML += `
          <a href="${audioFormat.url}" download class="download-btn audio">
            <i class="fas fa-music"></i> ${t.audioBtn}
          </a>`;
      }
    } else {
      // Handle stories
      const storyFormat = data.formats[0]; // Assuming first format is the story
      
      if (storyFormat.type === 'video') {
        mediaPreview.innerHTML = `<video controls src="${storyFormat.url}" poster="${data.thumbnail}"></video>`;
      } else {
        mediaPreview.innerHTML = `<img src="${storyFormat.url}" loading="lazy">`;
      }
      
      // Update metadata for story
      document.getElementById('description-text').textContent = data.title || t.noDescription;
      document.getElementById('author-text').textContent = data.author || 'Unknown';
      document.getElementById('like-count').textContent = 'N/A';
      document.getElementById('comment-count').textContent = 'N/A';
      document.getElementById('duration-container').style.display = 'none';
      
      // Update download buttons for story
      const downloadsContainer = document.getElementById('downloads');
      downloadsContainer.innerHTML = `
        <a href="${storyFormat.url}" download class="download-btn story">
          <i class="fas fa-download"></i> ${t.storyBtn}
        </a>`;
    }
    
    showResult();
  } catch (error) {
    console.error('Error:', error);
    showError();
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Add event listener for Enter key
  igUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      downloadIG();
    }
  });
  
  // Initialize with English language and post type
  switchLanguage('en');
  switchContentType('post');
});