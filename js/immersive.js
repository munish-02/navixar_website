/* IMMERSIVE INDIA EXPERIENCE JS — Enhanced */

document.addEventListener('DOMContentLoaded', () => {

  // ═══════════════════════════════════════════
  // 0. MARIGOLD GARLAND GENERATION
  // ═══════════════════════════════════════════
  const garlandInner = document.getElementById('garland-inner');
  if (garlandInner) {
    const flowerCount = Math.floor(window.innerWidth / 10);
    for (let i = 0; i < flowerCount; i++) {
      const el = document.createElement('div');
      if (i % 7 === 0) {
        el.className = 'marigold-leaf';
      } else {
        el.className = 'marigold-flower';
        el.style.animationDelay = (Math.random() * 3) + 's';
      }
      garlandInner.appendChild(el);
    }
  }

  // ═══════════════════════════════════════════
  // 0b. FLOATING DIYAS GENERATION
  // ═══════════════════════════════════════════
  const diyaContainers = document.querySelectorAll('.diya-container');
  diyaContainers.forEach(container => {
    for (let i = 0; i < 7; i++) {
      const diya = document.createElement('div');
      diya.className = 'diya';
      diya.style.left = (10 + i * 13) + '%';
      diya.style.animationDelay = (Math.random() * 5) + 's';
      diya.style.animationDuration = (6 + Math.random() * 4) + 's';
      container.appendChild(diya);
    }
  });

  // ═══════════════════════════════════════════
  // 1. AUDIO JOURNEY
  // ═══════════════════════════════════════════
  const btnAudio = document.getElementById('start-audio-btn');
  const audioHero = document.getElementById('audio-hero');
  const audioTraffic = document.getElementById('audio-traffic');
  const audioSitar = document.getElementById('audio-sitar');
  const audioMantra = document.getElementById('audio-mantra');

  let audioEnabled = false;

  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      audioEnabled = true;
      btnAudio.classList.add('hidden');

      [audioHero, audioTraffic, audioSitar].forEach(a => {
        if (a) {
          a.volume = 0;
          a.play().catch(e => console.log("Audio play blocked", e));
        }
      });
      audioHero.volume = 0.5;
    });
  }

  function crossfadeAudio(targetAudio) {
    if (!audioEnabled) return;
    const audios = [audioHero, audioTraffic, audioSitar];
    audios.forEach(a => {
      if (a && a !== targetAudio) {
        gsap.to(a, { volume: 0, duration: 1.5 });
      }
    });
    if (targetAudio) {
      gsap.to(targetAudio, { volume: 0.5, duration: 1.5 });
    }
  }

  // Section-based Audio & Weather
  const weatherOverlay = document.getElementById('weather-overlay');

  const sections = [
    { id: 'hero', audio: audioHero, weather: '' },
    { id: 'problem', audio: audioTraffic, weather: '' },
    { id: 'traffic', audio: audioTraffic, weather: 'dust' },
    { id: 'simulation', audio: audioSitar, weather: 'rain' }
  ];

  sections.forEach(sec => {
    const el = document.getElementById(sec.id);
    if (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => {
          crossfadeAudio(sec.audio);
          if (weatherOverlay) weatherOverlay.className = sec.weather;
        },
        onEnterBack: () => {
          crossfadeAudio(sec.audio);
          if (weatherOverlay) weatherOverlay.className = sec.weather;
        }
      });
    }
  });

  // ═══════════════════════════════════════════
  // 2. THESIS MANTRA
  // ═══════════════════════════════════════════
  const thesisSec = document.getElementById('thesis');
  let mantraPlayed = false;
  if (thesisSec) {
    ScrollTrigger.create({
      trigger: thesisSec,
      start: 'top 60%',
      onEnter: () => {
        if (audioEnabled && !mantraPlayed && audioMantra) {
          audioMantra.volume = 0.6;
          audioMantra.play();
          mantraPlayed = true;
        }
      }
    });
  }

  // ═══════════════════════════════════════════
  // 3. THE UNPREDICTABLE COW (CSS animation)
  // ═══════════════════════════════════════════

  // ═══════════════════════════════════════════
  // 4. HOLI COLOR BURST PARTICLES
  // ═══════════════════════════════════════════
  const holiColors = [
    '#ff1493', '#FFD700', '#00BFA5', '#ff9933',
    '#e91e63', '#9c27b0', '#FF6B35', '#0080FF',
    '#FF69B4', '#FFEB3B', '#00E5FF', '#FF4081'
  ];

  function createHoliBurst(x, y, count = 30) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'holi-particle';
      const size = 4 + Math.random() * 12;
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5);
      const distance = 80 + Math.random() * 200;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.backgroundColor = holiColors[Math.floor(Math.random() * holiColors.length)];
      particle.style.setProperty('--holi-dx', dx + 'px');
      particle.style.setProperty('--holi-dy', dy + 'px');
      particle.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';

      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 3000);
    }
  }

  // Holi burst on Hero enter
  const heroSec = document.getElementById('hero');
  let heroHoliFired = false;
  if (heroSec) {
    ScrollTrigger.create({
      trigger: heroSec,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        if (!heroHoliFired) {
          heroHoliFired = true;
          // Burst from multiple edges
          setTimeout(() => createHoliBurst(window.innerWidth * 0.2, window.innerHeight * 0.3, 20), 300);
          setTimeout(() => createHoliBurst(window.innerWidth * 0.8, window.innerHeight * 0.5, 20), 600);
          setTimeout(() => createHoliBurst(window.innerWidth * 0.5, window.innerHeight * 0.2, 15), 900);
        }
      }
    });
  }

  // ═══════════════════════════════════════════
  // 5. DIWALI FIRECRACKERS (Enhanced)
  // ═══════════════════════════════════════════
  const marketSec = document.getElementById('marketsize');
  let firecrackersTriggered = false;
  if (marketSec) {
    ScrollTrigger.create({
      trigger: marketSec,
      start: 'top 50%',
      onEnter: () => {
        if (!firecrackersTriggered) {
          createFirecrackers(marketSec);
          firecrackersTriggered = true;
          // Also burst Holi colors
          const rect = marketSec.getBoundingClientRect();
          createHoliBurst(rect.left + rect.width * 0.5, rect.top + rect.height * 0.3, 25);
        }
      }
    });
  }

  function createFirecrackers(container) {
    const crackerColors = ['#FFD700', '#FF6B35', '#e91e63', '#ff9933', '#FF1493', '#00BFA5'];
    for (let i = 0; i < 20; i++) {
      const fc = document.createElement('div');
      fc.className = 'firecracker';
      fc.style.left = (Math.random() * 100) + '%';
      fc.style.top = (Math.random() * 100) + '%';
      fc.style.animationDelay = (Math.random() * 2.5) + 's';
      fc.style.background = crackerColors[Math.floor(Math.random() * crackerColors.length)];
      fc.style.boxShadow = `0 0 10px ${fc.style.background}, 0 0 20px ${fc.style.background}`;
      container.appendChild(fc);
      setTimeout(() => fc.remove(), 5000);
    }
  }

  // ═══════════════════════════════════════════
  // 6. PEACOCK CURSOR TRAILS
  // ═══════════════════════════════════════════
  const trails = [
    document.getElementById('cur-trail-1'),
    document.getElementById('cur-trail-2'),
    document.getElementById('cur-trail-3')
  ];
  const problemSec = document.getElementById('problem');
  let inProblemArea = false;

  if (problemSec && trails[0]) {
    ScrollTrigger.create({
      trigger: problemSec,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => activateTrails(true),
      onLeave: () => activateTrails(false),
      onEnterBack: () => activateTrails(true),
      onLeaveBack: () => activateTrails(false)
    });
  }

  function activateTrails(state) {
    inProblemArea = state;
    trails.forEach(t => {
      if (t) t.classList.toggle('active', state);
    });
  }

  if (trails[0]) {
    let mouseX = 0, mouseY = 0;
    const positions = [
      { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }
    ];

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    gsap.ticker.add(() => {
      if (!inProblemArea) return;

      positions[0].x += (mouseX - positions[0].x) * 0.15;
      positions[0].y += (mouseY - positions[0].y) * 0.15;

      positions[1].x += (positions[0].x - positions[1].x) * 0.15;
      positions[1].y += (positions[0].y - positions[1].y) * 0.15;

      positions[2].x += (positions[1].x - positions[2].x) * 0.15;
      positions[2].y += (positions[1].y - positions[2].y) * 0.15;

      trails[0].style.transform = `translate3d(${positions[0].x + 15}px, ${positions[0].y + 15}px, 0)`;
      trails[1].style.transform = `translate3d(${positions[1].x + 25}px, ${positions[1].y + 25}px, 0)`;
      trails[2].style.transform = `translate3d(${positions[2].x + 35}px, ${positions[2].y + 35}px, 0)`;
    });
  }

  // ═══════════════════════════════════════════
  // 7. POTHOLE SCROLL GLITCH
  // ═══════════════════════════════════════════
  const potholeTrigger = document.getElementById('pothole-trigger');
  if (potholeTrigger) {
    ScrollTrigger.create({
      trigger: potholeTrigger,
      start: 'top 50%',
      onEnter: () => {
        document.body.classList.add('pothole-glitch');
        setTimeout(() => document.body.classList.remove('pothole-glitch'), 500);
      }
    });
  }

  // ═══════════════════════════════════════════
  // 8. RANGOLI POINT-CLOUD LOADER
  // ═══════════════════════════════════════════
  const interactiveSim = document.getElementById('interactive-sim');
  if (interactiveSim) {
    ScrollTrigger.create({
      trigger: interactiveSim,
      start: 'top 60%',
      once: true,
      onEnter: () => {
        setTimeout(() => {
          interactiveSim.classList.add('sim-loaded');
        }, 3000);
      }
    });
  }

  // ═══════════════════════════════════════════
  // 9. CHAI WALLA EASTER EGG
  // ═══════════════════════════════════════════
  const chaiWalla = document.getElementById('chai-walla');
  const trafficSec = document.getElementById('traffic');
  if (chaiWalla && trafficSec) {
    let inTraffic = false;
    ScrollTrigger.create({
      trigger: trafficSec,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => inTraffic = true,
      onLeave: () => inTraffic = false,
      onEnterBack: () => inTraffic = true,
      onLeaveBack: () => inTraffic = false
    });

    window.addEventListener('mousemove', (e) => {
      if (inTraffic && e.clientX < 80) {
        chaiWalla.classList.add('peek');
      } else {
        chaiWalla.classList.remove('peek');
      }
    });
  }

  // ═══════════════════════════════════════════
  // 10. AUTO-RICKSHAW FARE METER
  // ═══════════════════════════════════════════
  const fareTicker = document.getElementById('fare-ticker');
  const askSec = document.getElementById('ask');
  if (fareTicker && askSec) {
    ScrollTrigger.create({
      trigger: askSec,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        const state = { v: 0 };
        gsap.to(state, {
          v: 35,
          duration: 2.5,
          ease: "steps(35)",
          onUpdate: () => {
            let val = Math.round(state.v);
            fareTicker.textContent = val < 10 ? '0' + val : val;
          }
        });
      }
    });
  }

  // ═══════════════════════════════════════════
  // 11. TUK-TUK HORN ON CTA HOVER
  // ═══════════════════════════════════════════
  const ctaButtons = document.querySelectorAll('.btn.primary');
  let hornAudioCtx = null;

  function playTukTukHorn() {
    if (!audioEnabled) return;
    try {
      if (!hornAudioCtx) hornAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = hornAudioCtx.createOscillator();
      const gain = hornAudioCtx.createGain();
      osc.connect(gain);
      gain.connect(hornAudioCtx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(800, hornAudioCtx.currentTime);
      osc.frequency.setValueAtTime(600, hornAudioCtx.currentTime + 0.08);
      osc.frequency.setValueAtTime(800, hornAudioCtx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.05, hornAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, hornAudioCtx.currentTime + 0.25);

      osc.start(hornAudioCtx.currentTime);
      osc.stop(hornAudioCtx.currentTime + 0.25);
    } catch (e) {
      // Silently fail
    }
  }

  ctaButtons.forEach(btn => {
    btn.addEventListener('mouseenter', playTukTukHorn);
  });

  // ═══════════════════════════════════════════
  // 12. HOLI BURST ON ASK SECTION
  // ═══════════════════════════════════════════
  if (askSec) {
    let askHoliFired = false;
    ScrollTrigger.create({
      trigger: askSec,
      start: 'top 60%',
      once: true,
      onEnter: () => {
        if (!askHoliFired) {
          askHoliFired = true;
          const rect = askSec.getBoundingClientRect();
          createHoliBurst(rect.left + rect.width * 0.3, rect.top + 100, 15);
          setTimeout(() => createHoliBurst(rect.left + rect.width * 0.7, rect.top + 150, 15), 400);
        }
      }
    });
  }

});
