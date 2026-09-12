// DOM Elements
const doorContainer = document.getElementById('door-container');
const handle = document.getElementById('img-handle');
const peephole = document.getElementById('img-peephole');
const fadeOverlay = document.getElementById('fade-overlay');
const peepholeModal = document.getElementById('peephole-modal');
const startScreen = document.getElementById('start-screen');

let isDoorOpen = false;
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
   AUDIO PLACEHOLDERS
   ========================================================================== */
function playKnockSound() {
  try {
    const knockAudio = new Audio('Sounds/knock.mp3');
    knockAudio.volume = 0.8; // Adjust volume between 0.0 and 1.0 if needed
    knockAudio.play().catch((err) => {
      console.log("Audio playback waiting for interaction: ", err);
    });
  } catch (e) {
    console.error(e);
  }
}

function startKnockingLoop() {
  // First knock plays instantly when starting
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
    const hanldeAudio = new Audio('Sounds/handle.mp3');
     hanldeAudio.volume = 0.8; // Adjust volume between 0.0 and 1.0 if needed
     hanldeAudio.play().catch((err) => {
      console.log("Audio playback waiting for interaction: ", err);
    });
  } catch (e) {}
}

function playDoorOpenSound() {
  try {
    const doorAudio = new Audio('Sounds/door.m4a');
     doorAudio.volume = 0.8; 
     doorAudio.play().catch((err) => {
      console.log("Audio playback waiting for interaction: ", err);
    });
  } catch (e) {}
}

/* ==========================================================================
   START SCREEN & AUDIO INITIALIZATION
   ========================================================================== */
startScreen.addEventListener('click', () => {
  // 1. Resume Audio Context immediately on tap
  getAudioContext();

  // 2. Hide the Start Screen with smooth fade
  startScreen.classList.add('hidden');

  // 3. Start the knocking loop
  if (!isDoorOpen && !knockInterval) {
    startKnockingLoop();
  }
});

/* ==========================================================================
   PEEPHOLE & DOOR EVENTS
   ========================================================================== */
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

handle.addEventListener('click', (e) => {
  e.stopPropagation();

  if (!isDoorOpen) {
    isDoorOpen = true;
    stopKnockingLoop();

    playHandleSound();
    handle.classList.add('turned');

    setTimeout(() => {
      playDoorOpenSound();
      doorContainer.classList.add('open');
    }, 300);
  }
});