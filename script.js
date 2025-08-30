const envelope = $('.envelope');
const flap = $('.flap');
const card = $('.card');
const invitation = $('.invitation');
const infoButton = $('.info-button');
let flipped = false;

const jsConfetti = new JSConfetti()
const muteBtn = document.getElementById('mute-btn');
const music = document.getElementById("bg-music");

// Sparkle effect on mouse move
if ((window.location.pathname.endsWith('Index.html') || window.location.pathname.endsWith('Main.html')) && window.innerWidth >= 800) {
    const sparkleColors = ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7'];
    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        const size = Math.random() * 8 + 4;
        const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
        sparkle.style.position = 'fixed';
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
        sparkle.style.borderRadius = '50%';
        sparkle.style.background = color;
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = 9999;
        sparkle.style.opacity = '0.8';
        document.body.appendChild(sparkle);
        // Animate outward in random direction and shrink
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 40 + 20;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        sparkle.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 0.8 },
            { transform: `translate(${dx}px,${dy}px) scale(0.3)`, opacity: 0 }
        ], {
            duration: 600 + Math.random() * 300,
            easing: 'cubic-bezier(.68,-0.55,.27,1.55)'
        });
        setTimeout(() => sparkle.remove(), 700);
    }
    document.addEventListener('mousemove', e => {
        for (let i = 0; i < 2; i++) {
            createSparkle(e.clientX, e.clientY);
        }
    });
}

function pullOut() {
    const tl = new TimelineMax();

    // 1️⃣ Open the flap
    tl.to(flap, 1, {
        rotationX: 180,
        ease: Power1.easeInOut
    }, 'scaleBack')
    .to('.invitation', 1, {
        scale: 0.8,
        ease: Power4.easeInOut
    }, 'scaleBack')
    .set(flap, { zIndex: 0 });

    // 2️⃣ Animate card up inside envelope
    tl.to(card, 1, {
        y: '0%',
        scaleY: 1.2,
        ease: Circ.easeInOut
    })
    .set('.mask', {
        overflow: 'visible',
        onComplete: function() {
            envelope.addClass('is-open');
            invitation.css({
                'justify-content': 'center',
                'align-items': 'center',
                'flex-direction': 'column',
                'pointer-events': 'none',
            });

            // 3️⃣ Get card's position and size
            const cardRect = card[0].getBoundingClientRect();
            const invitationRect = invitation[0].getBoundingClientRect();

            // 4️⃣ Set card to absolute at its current position
            card.css({
                position: 'absolute',
                top: cardRect.top - invitationRect.top + 'px',
                left: cardRect.left - invitationRect.left + 'px',
                height: cardRect.height + 'px', 
                zIndex: 10
            });

            // 5️⃣ Move card out of envelope
            invitation.append(card);
            // Start music after envelope opens
            if (music.paused) music.play();

            // 6️⃣ Fade out envelope and flap
            TweenMax.to([envelope, flap], 1, {
                opacity: 0,
                delay: 1,
                onComplete: function() {
                    envelope.remove();
                    flap.remove();
                    // 7️⃣ Animate card to center
                    card.css({
                        transition: 'all 0.7s cubic-bezier(.68,-0.55,.27,1.55)',
                    });
                    setTimeout(() => {
                        card.css({
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            position: 'absolute',
                            width: '480px',
                            height: '',
                            maxWidth: '480px',
                            minWidth: '280px',
                        });
                        invitation.css({
                            'pointer-events': 'auto',
                        });
                    }, 50);
                }
            });
        }
    })
    .to('.mask', 1.3, {
        'clip-path': 'inset(0 0 0% 0)',
        ease: Circ.easeInOut
    }, 'moveDown')
    .to(card, 1.3, {
        y: '100%',
        scaleY: 1,
        ease: Circ.easeInOut
    }, 'moveDown');
}

// Toggle flip after card is out
function toggleFlip() {
    if (!envelope.hasClass('is-open')) return;

    const ry = !flipped ? 180 : 0;
    flipped = !flipped;

    TweenMax.to(card, 1, {
        rotationY: ry,
        ease: Power4.easeInOut
    });
}

// Event listeners
flap.on('click', pullOut);
envelope.on('click', function(e) {
    jsConfetti.addConfetti({
    confettiColors: [
        '#ff0a54', '#ff477e', '#ff7096', '#ff0000ff', '#5c1b99ff', '#babd1dff', '#00ff00', '#00f'
    ],
    confettiNumber: 80
    })
    music.play();
    if (!$(e.target).hasClass('flap')) pullOut();
});
flap.on('dblclick', toggleFlip);
// Show info section and remove invitation when info-button is clicked
$(document).on('click', '.info-button', function(e) {
    e.preventDefault();
    $('.invitation').remove();
    $('#info-section').show();
});
$('#confetti-btn').on('click', function() {
    jsConfetti.addConfetti({
        confettiColors: [
            '#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7',
        ],
        confettiNumber: 60
    });
});
muteBtn.addEventListener('click', function() {
  if (music.muted) {
    music.muted = false;
    muteBtn.textContent = '🔊';
  } else {
    music.muted = true;
    muteBtn.textContent = '🔇';
  }
});
