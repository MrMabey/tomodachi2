// YouTube Music Player
let youtubeVideos = [];
let currentPlayer = null;
let currentVideoId = null;

// Load saved videos from localStorage
function loadYoutubeVideos() {
  const stored = localStorage.getItem('youtubeVideos');
  if (stored) {
    youtubeVideos = JSON.parse(stored);
    renderYoutubeVideos();
  }
}

// Save videos to localStorage
function saveYoutubeVideos() {
  localStorage.setItem('youtubeVideos', JSON.stringify(youtubeVideos));
}

// Extract video ID from YouTube URL
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Fetch video title from YouTube (using oEmbed API)
async function fetchVideoTitle(videoId) {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    const data = await response.json();
    return data.title || 'Unknown Title';
  } catch (error) {
    console.error('Error fetching video title:', error);
    return 'YouTube Video';
  }
}

// Add YouTube video
async function addYoutubeVideo() {
  const input = document.getElementById('youtubeUrlInput');
  const url = input.value.trim();

  if (!url) {
    alert('Please enter a YouTube URL');
    return;
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    alert('Invalid YouTube URL. Please use a valid YouTube video link.');
    return;
  }

  // Check if already exists
  if (youtubeVideos.some(v => v.id === videoId)) {
    alert('This video is already in your list');
    return;
  }

  // Fetch title
  const title = await fetchVideoTitle(videoId);

  // Add to list
  youtubeVideos.push({
    id: videoId,
    title: title,
    url: url,
    addedAt: Date.now()
  });

  input.value = '';
  saveYoutubeVideos();
  renderYoutubeVideos();
}

// Render YouTube videos list
function renderYoutubeVideos() {
  const list = document.getElementById('youtubeVideoList');

  if (youtubeVideos.length === 0) {
    list.innerHTML = `
      <div style="
        text-align: center;
        padding: 30px;
        color: rgba(255,255,255,0.5);
        font-size: 14px;
      ">
        No videos added yet. Add a YouTube link above to get started!
      </div>
    `;
    return;
  }

  list.innerHTML = youtubeVideos.map(video => `
    <div style="
      background: rgba(255,255,255,0.1);
      padding: 12px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    ">
      <img
        src="https://img.youtube.com/vi/${video.id}/default.jpg"
        style="width: 60px; height: 45px; border-radius: 4px; object-fit: cover;"
        alt="${video.title}"
      />
      <div style="flex: 1; min-width: 0;">
        <div style="
          color: white;
          font-size: 14px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        ">${video.title}</div>
      </div>
      <button
        onclick="playYoutubeVideo('${video.id}', '${video.title.replace(/'/g, "\\'")}')"
        style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          padding: 8px 15px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          white-space: nowrap;
        "
      >▶ Play</button>
      <button
        onclick="deleteYoutubeVideo('${video.id}', event)"
        style="
          background: #f44336;
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        "
      >✕</button>
    </div>
  `).join('');
}

// Play YouTube video (audio only via iframe)
function playYoutubeVideo(videoId, title) {
  currentVideoId = videoId;

  // Show now playing section
  const nowPlayingSection = document.getElementById('nowPlayingSection');
  const nowPlayingTitle = document.getElementById('nowPlayingTitle');
  nowPlayingSection.style.display = 'block';
  nowPlayingTitle.textContent = title;

  // Remove existing player if any
  if (currentPlayer) {
    document.body.removeChild(currentPlayer);
  }

  // Create invisible iframe for audio playback
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
  iframe.allow = 'autoplay; encrypted-media';
  iframe.id = 'youtubePlayer';

  document.body.appendChild(iframe);
  currentPlayer = iframe;

  // Dispatch event to trigger music notes
  window.dispatchEvent(new Event('musicPlaying'));

  console.log(`🎵 Now playing: ${title}`);
}

// Pause music (stop the iframe)
function pauseMusic() {
  if (currentPlayer) {
    // Send pause command to iframe
    currentPlayer.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');

    // Dispatch event to stop music notes
    window.dispatchEvent(new Event('musicStopped'));
  }
}

// Stop music
function stopMusic() {
  if (currentPlayer) {
    document.body.removeChild(currentPlayer);
    currentPlayer = null;
    currentVideoId = null;

    const nowPlayingSection = document.getElementById('nowPlayingSection');
    nowPlayingSection.style.display = 'none';

    // Dispatch event to stop music notes
    window.dispatchEvent(new Event('musicStopped'));
  }
}

// Delete YouTube video
function deleteYoutubeVideo(videoId, event) {
  if (event) event.stopPropagation();

  if (confirm('Delete this video from your list?')) {
    youtubeVideos = youtubeVideos.filter(v => v.id !== videoId);

    // Stop if currently playing
    if (currentVideoId === videoId) {
      stopMusic();
    }

    saveYoutubeVideos();
    renderYoutubeVideos();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadYoutubeVideos();

  // Allow Enter key to add video
  const input = document.getElementById('youtubeUrlInput');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addYoutubeVideo();
      }
    });
  }
});
