/* ─── Navixar — "Let's Take A Break" Intervals ───
   1. The Junction — survive the crossing, then the ADAS question
   2. You Be The Model — label Indian traffic before it escapes
*/
(function () {
  'use strict';

  /* ════════════════════════════════════
     1. THE JUNCTION
  ════════════════════════════════════ */
  (function junction() {
    const canvas = document.getElementById('jxCanvas');
    const stage = document.getElementById('jxStage');
    if (!canvas || !stage) return;
    const ctx = canvas.getContext('2d');
    const nearEl = document.getElementById('jxNear');
    const quizEl = document.getElementById('jxQuiz');
    const titleEl = document.getElementById('jxqTitle');

    let W = 0, H = 0, dpr = 1, running = false, done = false;
    let nearMisses = 0, startTime = 0;
    const player = { x: 0.5, y: 0.93, tx: 0.5, ty: 0.93, r: 8 };
    let agents = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      agents = [];
      const carCols = ['#d8d3c8', '#8e8e93', '#c62828', '#5a6b8c', '#3d3d42'];
      for (let i = 0; i < 9; i++) { // cars on the two roads
        const horiz = i % 2 === 0;
        agents.push({
          kind: 'car', horiz, dir: Math.random() < 0.5 ? 1 : -1,
          lane: 0.44 + Math.random() * 0.12,
          p: Math.random(), speed: (0.05 + Math.random() * 0.06),
          w: 36, h: 17, col: carCols[i % carCols.length], cool: 0
        });
      }
      for (let i = 0; i < 5; i++) { // autos, weaving
        const horiz = i % 2 === 1;
        agents.push({
          kind: 'auto', horiz, dir: Math.random() < 0.5 ? 1 : -1,
          lane: 0.43 + Math.random() * 0.14, wob: Math.random() * 6.28,
          p: Math.random(), speed: (0.06 + Math.random() * 0.05),
          w: 24, h: 13, col: '#f5a623', cool: 0
        });
      }
      for (let i = 0; i < 26; i++) { // pedestrians everywhere
        agents.push({
          kind: 'ped', x: Math.random(), y: Math.random(),
          tx: Math.random(), ty: Math.random(),
          speed: 0.015 + Math.random() * 0.03, r: 4,
          col: ['#fdfbf7', '#ffb300', '#e91e63', '#00bfa5', '#b8a9c4'][i % 5], cool: 0
        });
      }
      for (let i = 0; i < 2; i++) { // cows: slow, indifferent
        agents.push({
          kind: 'cow', x: Math.random(), y: 0.35 + Math.random() * 0.3,
          tx: Math.random(), ty: 0.35 + Math.random() * 0.3,
          speed: 0.006, r: 9, col: '#cbb9a0', pause: 0, cool: 0
        });
      }
    }

    function drawRoads() {
      // ground
      ctx.fillStyle = '#1c1633'; ctx.fillRect(0, 0, W, H);
      // asphalt
      ctx.fillStyle = '#3a3450';
      ctx.fillRect(0, H * 0.40, W, H * 0.22);          // horizontal road
      ctx.fillRect(W * 0.40, 0, W * 0.22, H);          // vertical road
      // road edges
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(0, H * 0.40, W, H * 0.22);
      ctx.strokeRect(W * 0.40, 0, W * 0.22, H);
      // centre dashes
      ctx.strokeStyle = 'rgba(255,215,0,0.5)'; ctx.setLineDash([14, 18]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, H * 0.51); ctx.lineTo(W, H * 0.51); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W * 0.51, 0); ctx.lineTo(W * 0.51, H); ctx.stroke();
      ctx.setLineDash([]);
      // goal line + label
      ctx.strokeStyle = 'rgba(48,209,88,0.95)'; ctx.setLineDash([10, 8]); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, H * 0.06); ctx.lineTo(W, H * 0.06); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(48,209,88,0.9)';
      ctx.font = '800 11px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('— SAFE SIDE —', W / 2, H * 0.045);
      // fruit cart (static cluster) near centre-left
      const cx = W * 0.30, cy = H * 0.52;
      ctx.fillStyle = '#7a4a1f'; ctx.fillRect(cx - 16, cy - 8, 32, 16);
      const fruit = ['#ff9933', '#ffd700', '#c62828', '#2e7d32'];
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = fruit[i % 4];
        ctx.beginPath();
        ctx.arc(cx - 11 + (i % 5) * 5.5, cy - 3 + Math.floor(i / 5) * 6, 2.6, 0, 6.29);
        ctx.fill();
      }
      ctx.fillStyle = '#fdfbf7';
      ctx.beginPath(); ctx.arc(cx, cy - 16, 4, 0, 6.29); ctx.fill(); // vendor
    }

    function step(dt) {
      agents.forEach(a => {
        if (a.cool > 0) a.cool -= dt;
        if (a.kind === 'car' || a.kind === 'auto') {
          a.p += a.speed * dt * a.dir;
          if (a.p > 1.15) a.p = -0.15; if (a.p < -0.15) a.p = 1.15;
          if (a.kind === 'auto') a.wob += dt * 3;
        } else {
          if (a.kind === 'cow' && a.pause > 0) { a.pause -= dt; return; }
          const dx = a.tx - a.x, dy = a.ty - a.y;
          const d = Math.hypot(dx, dy);
          if (d < 0.02) {
            a.tx = Math.random(); a.ty = a.kind === 'cow' ? 0.3 + Math.random() * 0.4 : Math.random();
            if (a.kind === 'cow' && Math.random() < 0.5) a.pause = 1.5 + Math.random() * 2;
          } else {
            a.x += (dx / d) * a.speed * dt; a.y += (dy / d) * a.speed * dt;
          }
        }
      });
      // player follows pointer
      player.x += (player.tx - player.x) * 0.09;
      player.y += (player.ty - player.y) * 0.09;

      // near-miss detection
      const px = player.x * W, py = player.y * H;
      agents.forEach(a => {
        let ax, ay, rad;
        if (a.kind === 'car' || a.kind === 'auto') {
          if (a.horiz) { ax = a.p * W; ay = a.lane * H + (a.kind === 'auto' ? Math.sin(a.wob) * 8 : 0); }
          else { ax = a.lane * W + (a.kind === 'auto' ? Math.sin(a.wob) * 8 : 0); ay = a.p * H; }
          rad = 22;
        } else { ax = a.x * W; ay = a.y * H; rad = a.r + 6; }
        if (a.cool <= 0 && Math.hypot(px - ax, py - ay) < rad + player.r) {
          a.cool = 1.2; nearMisses++;
          nearEl.textContent = nearMisses + ' near-miss' + (nearMisses === 1 ? '' : 'es');
          a.flash = 0.5;
        }
        if (a.flash > 0) a.flash -= dt;
      });

      // win / timeout
      if (player.y < 0.07) finish(true);
      else if ((performance.now() - startTime) / 1000 > 45) finish(false);
    }

    function draw() {
      drawRoads();
      agents.forEach(a => {
        ctx.save();
        if (a.kind === 'car' || a.kind === 'auto') {
          let ax, ay;
          if (a.horiz) { ax = a.p * W; ay = a.lane * H + (a.kind === 'auto' ? Math.sin(a.wob) * 8 : 0); }
          else { ax = a.lane * W + (a.kind === 'auto' ? Math.sin(a.wob) * 8 : 0); ay = a.p * H; }
          ctx.translate(ax, ay);
          if (!a.horiz) ctx.rotate(Math.PI / 2);
          ctx.shadowColor = a.flash > 0 ? '#ff453a' : 'rgba(0,0,0,.7)';
          ctx.shadowBlur = a.flash > 0 ? 22 : 10;
          ctx.fillStyle = a.col;
          const w = a.w, h = a.h;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(-w / 2, -h / 2, w, h, 4) : ctx.rect(-w / 2, -h / 2, w, h);
          ctx.fill();
          ctx.fillStyle = 'rgba(120,180,255,.4)';
          ctx.fillRect(-w / 2 + 4, -h / 2 + 2, w * 0.28, h - 4);
        } else {
          const ax = a.x * W, ay = a.y * H;
          ctx.shadowColor = a.flash > 0 ? '#ff453a' : 'rgba(0,0,0,.8)';
          ctx.shadowBlur = a.flash > 0 ? 20 : 5;
          ctx.fillStyle = a.col;
          ctx.beginPath(); ctx.arc(ax, ay, a.r + 1, 0, 6.29); ctx.fill();
          if (a.kind === 'cow') { // horns
            ctx.strokeStyle = '#cbb9a0'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(ax - 7, ay - 7); ctx.lineTo(ax - 11, ay - 12); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ax + 7, ay - 7); ctx.lineTo(ax + 11, ay - 12); ctx.stroke();
          }
        }
        ctx.restore();
      });
      // player
      const px = player.x * W, py = player.y * H;
      ctx.save();
      ctx.shadowColor = '#2997ff'; ctx.shadowBlur = 22;
      ctx.fillStyle = '#2997ff';
      ctx.beginPath(); ctx.arc(px, py, player.r, 0, 6.29); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(px, py, 3, 0, 6.29); ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(41,151,255,.9)';
      ctx.font = '700 10px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('YOU', px, py - 14);
    }

    let last = 0;
    function loop(t) {
      if (!running) return;
      const dt = Math.min((t - last) / 1000, 0.05); last = t;
      step(dt); draw();
      requestAnimationFrame(loop);
    }

    function finish(crossed) {
      if (done) return;
      done = true; running = false;
      titleEl.textContent = crossed
        ? 'You made it across with ' + nearMisses + ' near-miss' + (nearMisses === 1 ? '' : 'es') + '.'
        : nearMisses + ' near-misses, and the junction is still not done with you.';
      quizEl.hidden = false;
    }

    function setPointer(e) {
      const r = canvas.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      player.tx = Math.max(0, Math.min(1, cx / r.width));
      player.ty = Math.max(0, Math.min(1, cy / r.height));
    }
    canvas.addEventListener('pointermove', setPointer);
    canvas.addEventListener('touchmove', e => { setPointer(e); e.preventDefault(); }, { passive: false });

    // quiz wiring
    document.getElementById('jxqOpts').addEventListener('click', e => {
      const btn = e.target.closest('button'); if (!btn) return;
      document.querySelectorAll('#jxqOpts button').forEach(b => {
        b.classList.add(b.dataset.a === '1' ? 'right' : 'wrong');
        b.disabled = true;
      });
      document.getElementById('jxqReveal').hidden = false;
    });
    document.getElementById('jxqContinue').addEventListener('click', () => {
      const t = document.getElementById('interest-branching');
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // start/stop with visibility
    new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting && !done && !running) {
          resize(); spawn();
          running = true; startTime = performance.now(); last = startTime;
          requestAnimationFrame(loop);
        } else if (!en.isIntersecting) running = false;
      });
    }, { threshold: 0.35 }).observe(stage);
    window.addEventListener('resize', () => { if (running) resize(); });
  })();

  /* ════════════════════════════════════
     2. YOU BE THE MODEL
  ════════════════════════════════════ */
  (function labeller() {
    const stage = document.getElementById('lbStage');
    const road = document.getElementById('lbRoad');
    if (!stage || !road) return;
    const CLASSES = [
      ['🐄', 'CATTLE'], ['🛺', 'AUTO-RICKSHAW'], ['🐃', 'BUFFALO'],
      ['🛒', 'HANDCART'], ['🐕', 'STRAY DOG'], ['🏍', 'TRIPLE-RIDING'],
      ['🚐', 'TEMPO'], ['🚲', 'CYCLE'], ['🐎', 'BARAAT HORSE'], ['🚶', 'JAYWALKER']
    ];
    const DURATION = 25;
    let score = 0, missed = 0, spawned = 0, playing = false, timeLeft = DURATION;
    let spawnTimer = null, clockTimer = null;
    const scoreEl = document.getElementById('lbScore');
    const missEl = document.getElementById('lbMissed');
    const timerEl = document.getElementById('lbTimer');

    function spawnItem() {
      if (!playing) return;
      const c = CLASSES[Math.floor(Math.random() * CLASSES.length)];
      const el = document.createElement('div');
      el.className = 'lb-item';
      el.textContent = c[0];
      el.dataset.label = c[1];
      el.style.top = (14 + Math.random() * 62) + '%';
      el.style.left = '102%';
      road.appendChild(el);
      spawned++;
      const dur = 3800 + Math.random() * 3200;
      const start = performance.now();
      function move(t) {
        if (!el.isConnected) return;
        if (el.classList.contains('tagged')) return;
        const k = (t - start) / dur;
        if (k >= 1) {
          if (playing && !el.classList.contains('tagged')) {
            missed++; missEl.textContent = missed + ' missed';
          }
          el.remove(); return;
        }
        el.style.left = (102 - k * 116) + '%';
        requestAnimationFrame(move);
      }
      requestAnimationFrame(move);
      el.addEventListener('pointerdown', () => {
        if (el.classList.contains('tagged') || !playing) return;
        el.classList.add('tagged');
        score++; scoreEl.textContent = score + ' labelled';
        setTimeout(() => el.classList.add('gone'), 250);
        setTimeout(() => el.remove(), 1600);
      });
      spawnTimer = setTimeout(spawnItem, 900 + Math.random() * 700);
    }

    function end() {
      playing = false;
      clearTimeout(spawnTimer); clearInterval(clockTimer);
      road.querySelectorAll('.lb-item').forEach(el => el.remove());
      const total = score + missed;
      const acc = total ? Math.round((score / total) * 100) : 0;
      document.getElementById('lbEndTitle').textContent =
        'You labelled ' + score + ' of ' + total + ' (' + acc + '%).';
      document.getElementById('lbEndText').innerHTML =
        'Every object you just tagged (the cattle, the handcart, the triple-riding bike) is a class that barely exists in Western training data. <strong>Now imagine a million Indians doing this daily, inside a game, on real reconstructed streets.</strong> That is Navixar’s gamified flywheel: your 25 seconds of fun is our labelled training data, at a scale no sensor fleet can buy.';
      document.getElementById('lbEnd').hidden = false;
    }

    document.getElementById('lbStartBtn').addEventListener('click', () => {
      document.getElementById('lbStart').style.display = 'none';
      playing = true; score = 0; missed = 0; spawned = 0; timeLeft = DURATION;
      scoreEl.textContent = '0 labelled'; missEl.textContent = '0 missed';
      spawnItem();
      clockTimer = setInterval(() => {
        timeLeft--; timerEl.textContent = timeLeft + 's';
        if (timeLeft <= 0) end();
      }, 1000);
    });
    document.getElementById('lbContinue').addEventListener('click', () => {
      const t = document.getElementById('team');
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  })();

})();
