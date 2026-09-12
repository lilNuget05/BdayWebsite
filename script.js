// If the user already met the reaper, skip the door interaction and go straight to home.html
if (localStorage.getItem('metReaper') === 'true') {
  window.location.href = 'home.html';
}

// DOM Elements
const doorContainer = document.getElementById('door-container');
const handle = document.getElementById('img-handle');
const lock = document.getElementById('img-lock');
const key = document.getElementById('img-key');
const peephole = document.getElementById('img-peephole');
const fadeOverlay = document.getElementById('fade-overlay');
const peepholeModal = document.getElementById('peephole-modal');
const startScreen = document.getElementById('start-screen');
const reaperContainer = document.getElementById('reaper-container');
const newspaperModal = document.getElementById('newspaper-modal');
const btnProceed = document.getElementById('btn-proceed');

let isDoorOpen = false;
let isUnlocked = false;
let knockInterval = null;

// Audio Context Setup
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/* ==========================================================================
   AUDIO HANDLERS
   ========================================================================== */
function playKnockSound() {
  try {
    const audio = new Audio('Sounds/knock.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch (e) {}
}

function startKnockingLoop() {
  playKnockSound();
  knockInterval = setInterval(() => {
    if (!isDoorOpen) {
      playKnockSound();
    } else {
      stopKnockingLoop();
    }
  }, 3500);
}

function stopKnockingLoop() {
  if (knockInterval) {
    clearInterval(knockInterval);
    knockInterval = null;
  }
}

function playHandleSound() {
  try {
    const audio = new Audio('Sounds/handle.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch (e) {}
}

function playUnlockSound() {
  try {
    const audio = new Audio('Sounds/unlock.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch (e) {}
}

function playDoorOpenSound() {
  try {
    const audio = new Audio('Sounds/door.m4a');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch (e) {}
}

/* ==========================================================================
   KEY DRAG & DROP LOGIC (Touch + Mouse Support)
   ========================================================================== */
let isDragging = false;
let startX = 0, startY = 0;
let initialLeft = 0, initialTop = 0;

function onDragStart(e) {
  if (isUnlocked) return;
  isDragging = true;
  
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
  startX = clientX;
  startY = clientY;
  
  initialLeft = key.offsetLeft;
  initialTop = key.offsetTop;
}

function onDragMove(e) {
  if (!isDragging) return;
  e.preventDefault();

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const deltaX = clientX - startX;
  const deltaY = clientY - startY;

  key.style.left = `${initialLeft + deltaX}px`;
  key.style.top = `${initialTop + deltaY}px`;

  // Check collision with lock during drag
  if (checkCollision(key, lock)) {
    unlockDoor();
  }
}

function onDragEnd() {
  isDragging = false;
}

function checkCollision(elem1, elem2) {
  const r1 = elem1.getBoundingClientRect();
  const r2 = elem2.getBoundingClientRect();

  return !(
    r1.right < r2.left ||
    r1.left > r2.right ||
    r1.bottom < r2.top ||
    r1.top > r2.bottom
  );
}

function unlockDoor() {
  isUnlocked = true;
  isDragging = false;

  playUnlockSound();

  // Hide key and visually mark lock as unlocked
  key.classList.add('hidden');
  lock.classList.add('unlocked');
}

// Attach Drag Listeners
key.addEventListener('mousedown', onDragStart);
document.addEventListener('mousemove', onDragMove);
document.addEventListener('mouseup', onDragEnd);

key.addEventListener('touchstart', onDragStart, { passive: false });
document.addEventListener('touchmove', onDragMove, { passive: false });
document.addEventListener('touchend', onDragEnd);

/* ==========================================================================
   INTERACTION LOGIC
   ========================================================================== */

// 1. Unlock Audio on initial screen tap
startScreen.addEventListener('click', () => {
  getAudioContext();
  startScreen.classList.add('hidden');
  if (!isDoorOpen && !knockInterval) {
    startKnockingLoop();
  }
});

// 2. Peephole View
peephole.addEventListener('click', (e) => {
  e.stopPropagation();
  if (isDoorOpen) return;

  fadeOverlay.classList.add('active');
  setTimeout(() => {
    peepholeModal.classList.add('visible');
    setTimeout(() => {
      fadeOverlay.classList.remove('active');
    }, 100);
  }, 400);
});

peepholeModal.addEventListener('click', () => {
  fadeOverlay.classList.add('active');
  setTimeout(() => {
    peepholeModal.classList.remove('visible');
    setTimeout(() => {
      fadeOverlay.classList.remove('active');
    }, 100);
  }, 400);
});

// 3. Open Door via Handle (Locked / Unlocked check)
handle.addEventListener('click', (e) => {
  e.stopPropagation();

  if (isDoorOpen) return;

  if (!isUnlocked) {
    // Play handle click/jammed sound and trigger shake animation
    playHandleSound();
    handle.classList.remove('locked-shake');
    void handle.offsetWidth; // Trigger reflow for animation restart
    handle.classList.add('locked-shake');
    return;
  }

  // If unlocked, open door
  isDoorOpen = true;
  stopKnockingLoop();

  playHandleSound();
  handle.classList.add('turned');

  setTimeout(() => {
    playDoorOpenSound();
    doorContainer.classList.add('open');
  }, 300);
});

// 4. Click Reaper / Newspaper to view full newspaper modal
reaperContainer.addEventListener('click', () => {
  if (isDoorOpen) {
    newspaperModal.classList.add('visible');
  }
});

// 5. Proceed button action
btnProceed.addEventListener('click', (e) => {
  e.stopPropagation();
  localStorage.setItem('metReaper', 'true');
  window.location.href = 'home.html';
});