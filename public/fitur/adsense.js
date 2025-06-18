// Initialize Google AdSense
document.addEventListener('DOMContentLoaded', function() {
  const adScript = document.createElement('script');
  adScript.async = true;
  adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8524552159379479';
  adScript.crossOrigin = 'anonymous';
  document.head.appendChild(adScript);
  
  // Push ad configuration
  (adsbygoogle = window.adsbygoogle || []).push({
    google_ad_client: "ca-pub-8524552159379479",
    enable_page_level_ads: true
  });
});