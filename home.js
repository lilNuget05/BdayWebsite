/* ==========================================================================
   1. COUNTDOWN CLOCK LOGIC (Target: October 24th)
   ========================================================================== */
function initCountdown() {
  const currentYear = new Date().getFullYear();
  let targetDate = new Date(`October 24, ${currentYear} 00:00:00`).getTime();
  
  // If October 24th has passed this year, point to next year's October 24th
  if (new Date().getTime() > targetDate) {
    targetDate = new Date(`October 24, ${currentYear + 1} 00:00:00`).getTime();
  }

  const elDays = document.getElementById('days');
  const elHours = document.getElementById('hours');
  const elMinutes = document.getElementById('minutes');
  const elSeconds = document.getElementById('seconds');

  

  function updateClock() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    elDays.textContent = String(days).padStart(2, '0');
    elHours.textContent = String(hours).padStart(2, '0');
    elMinutes.textContent = String(minutes).padStart(2, '0');
    elSeconds.textContent = String(seconds).padStart(2, '0');
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   2. POWERPOINT-STYLE SLIDE DECK (PUSH TRANSITIONS)
   ========================================================================== */
function initSlideDeck() {
  const slides = Array.from(document.querySelectorAll('.slide-card'));
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const dotsContainer = document.getElementById('slide-dots');

  let currentIndex = 0;
  let isAnimating = false;

  // Render navigation dots
  slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (idx === 0) dot.classList.add('active');
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.dot');

  function updateControls() {
    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === slides.length - 1;
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function goToSlide(newIndex, direction) {
    if (isAnimating || newIndex === currentIndex) return;
    isAnimating = true;

    const currentSlide = slides[currentIndex];
    const nextSlide = slides[newIndex];

    if (direction === 'next') {
      // Current slides out to the left
      currentSlide.className = 'slide-card exit-left';
      // Next slide comes from the right
      nextSlide.className = 'slide-card active';
    } else {
      // Current slides out to the right
      currentSlide.className = 'slide-card';
      // Next slide starts left, then slides into center
      nextSlide.className = 'slide-card enter-left';
      // Force repaint to trigger CSS transition
      void nextSlide.offsetWidth;
      nextSlide.className = 'slide-card active';
    }

    currentIndex = newIndex;
    updateControls();

    setTimeout(() => {
      isAnimating = false;
    }, 450);
  }

  btnNext.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
      goToSlide(currentIndex + 1, 'next');
    }
  });

  btnPrev.addEventListener('click', () => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1, 'prev');
    }
  });

  updateControls();
}

/* ==========================================================================
   3. REPLAY / RESET STATE
   ========================================================================== */
const btnReplay = document.getElementById('btn-replay');
if (btnReplay) {
  btnReplay.addEventListener('click', () => {
    localStorage.removeItem('metReaper');
    window.location.href = 'index.html';
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initSlideDeck();
  initReactions(); // Make sure this is called!
});

/* ==========================================================================
   4. GOOGLE SHEETS REACTION WALL & GIPHY GIF INTEGRATION
   ========================================================================== */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzA84F2evD3NEbJYjZNq7v-IzfRqiKZ3OXD_snOTJ5uEh8nr4iGT5x6QJaTGqFLkDVtWw/exec';

// Replace this string with your GIPHY API key from developers.giphy.com
const GIPHY_API_KEY = 'ShEc4loQ7vSUrtkwAnKcNU7o2q6Re9ql'; 

function initReactions() {
  const usernameInput = document.getElementById('username-input');
  const textInput = document.getElementById('reaction-text');
  const btnSubmit = document.getElementById('btn-submit-reaction');
  const feed = document.getElementById('reactions-feed');

  if (!usernameInput || !textInput || !btnSubmit || !feed) return;

  // GIF Picker Elements
  const btnOpenGif = document.getElementById('btn-open-gif-picker');
  const btnCloseGif = document.getElementById('btn-close-gif');
  const gifModal = document.getElementById('gif-picker-modal');
  const gifSearchInput = document.getElementById('gif-search-input');
  const gifGrid = document.getElementById('gif-grid');
  
  const selectedGifContainer = document.getElementById('selected-gif-container');
  const selectedGifPreview = document.getElementById('selected-gif-preview');
  const btnRemoveGif = document.getElementById('btn-remove-gif');

  let currentSelectedGifUrl = '';

  // 1. Username Persistence
  const savedUsername = localStorage.getItem('guestUsername');
  if (savedUsername) {
    usernameInput.value = savedUsername;
  }
  usernameInput.addEventListener('input', () => {
    localStorage.setItem('guestUsername', usernameInput.value.trim());
  });

  // 2. Fetch Reactions from Google Sheets
  async function loadReactions() {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      const reactions = await response.json();
      
      feed.innerHTML = '';
      if (reactions.length === 0) {
        feed.innerHTML = '<div class="feed-loading">No reactions yet. Be the first!</div>';
        return;
      }

      reactions.reverse().forEach(r => {
        const card = document.createElement('div');
        card.className = 'reaction-card';
        
        let textHtml = r.content && r.type !== 'image' ? `<p class="reaction-msg">${escapeHtml(r.content)}</p>` : '';
        let gifHtml = r.type === 'image' || (r.content && r.content.includes('.gif')) ? 
          `<img src="${escapeHtml(r.content)}" class="reaction-media" alt="Reaction GIF" />` : '';

        card.innerHTML = `
          <span class="reaction-user">@${escapeHtml(r.username || 'Anonymous')}</span>
          ${textHtml}
          ${gifHtml}
        `;
        feed.appendChild(card);
      });
    } catch (err) {
      feed.innerHTML = '<div class="feed-loading">Failed to load reactions.</div>';
    }
  }

  // 3. GIPHY Search Logic
  async function searchGiphyGifs(query = 'spooky') {
    if (!gifGrid) return;
    gifGrid.innerHTML = '<div class="feed-loading">Searching GIFs...</div>';
    try {
      const endpoint = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=12&rating=g`;
      const res = await fetch(endpoint);
      const data = await res.json();
      
      gifGrid.innerHTML = '';
      if (!data.data || data.data.length === 0) {
        gifGrid.innerHTML = '<div class="feed-loading">No GIFs found.</div>';
        return;
      }

      data.data.forEach(item => {
        const fullGifUrl = item.images.original.url;
        const thumbnailUrl = item.images.fixed_height_small.url;
        
        const img = document.createElement('img');
        img.src = thumbnailUrl;
        img.className = 'gif-item';
        
        img.addEventListener('click', () => {
          currentSelectedGifUrl = fullGifUrl;
          if (selectedGifPreview) selectedGifPreview.src = fullGifUrl;
          if (selectedGifContainer) selectedGifContainer.classList.remove('hidden');
          if (gifModal) gifModal.classList.remove('visible');
        });

        gifGrid.appendChild(img);
      });
    } catch (err) {
      gifGrid.innerHTML = '<div class="feed-loading">Error loading GIFs. Verify API key.</div>';
    }
  }

  // Modal Controls
  if (btnOpenGif) {
    btnOpenGif.addEventListener('click', () => {
      if (gifModal) gifModal.classList.add('visible');
      searchGiphyGifs('party');
    });
  }

  if (btnCloseGif) {
    btnCloseGif.addEventListener('click', () => {
      if (gifModal) gifModal.classList.remove('visible');
    });
  }

  // Search input debounce handler
  if (gifSearchInput) {
    let searchTimeout;
    gifSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const q = e.target.value.trim();
        searchGiphyGifs(q || 'party');
      }, 400);
    });
  }

  // Remove Selected GIF
  if (btnRemoveGif) {
    btnRemoveGif.addEventListener('click', () => {
      currentSelectedGifUrl = '';
      if (selectedGifPreview) selectedGifPreview.src = '';
      if (selectedGifContainer) selectedGifContainer.classList.add('hidden');
    });
  }

  // 4. Post New Reaction
  btnSubmit.addEventListener('click', async () => {
    const username = usernameInput.value.trim() || 'Anonymous';
    const text = textInput.value.trim();
    const gifUrl = currentSelectedGifUrl;

    if (!text && !gifUrl) return;

    btnSubmit.disabled = true;
    btnSubmit.textContent = '...';

    const payload = {
      username: username,
      content: gifUrl ? gifUrl : text,
      type: gifUrl ? 'image' : 'text'
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      textInput.value = '';
      currentSelectedGifUrl = '';
      if (selectedGifContainer) selectedGifContainer.classList.add('hidden');

      setTimeout(() => {
        loadReactions();
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'POST';
      }, 1000);

    } catch (err) {
      alert('Could not submit reaction.');
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'POST';
    }
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  loadReactions();

  // 2. Auto-fetch new reactions every 5 seconds (5000 ms)
  const POLL_INTERVAL = 5000; 
  const pollTimer = setInterval(() => {
    loadReactions();
  }, POLL_INTERVAL);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(pollTimer);
    } else {
      loadReactions(); // Fetch immediately on return
      setInterval(loadReactions, POLL_INTERVAL);
    }
  });

}

