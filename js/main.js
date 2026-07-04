/* ─── Navixar Investor Site — Scroll Narrative & Interaction Logic ─── */

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ════════════════════════════════════
// 1. CUSTOM CURSOR
// ════════════════════════════════════
const cur = document.getElementById('cur');
const cur2 = document.getElementById('cur2');
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

if (!isTouchDevice && cur && cur2) {
  let mouseX = 0, mouseY = 0, cur2X = 0, cur2Y = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  gsap.ticker.add(() => {
    cur2X += (mouseX - cur2X) * 0.35;
    cur2Y += (mouseY - cur2Y) * 0.35;
    cur.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
    cur2.style.transform = `translate3d(${cur2X - 16}px, ${cur2Y - 16}px, 0)`;
  });

  window.addEventListener('mousedown', () => {
    gsap.to(cur, { scale: 1.5, duration: 0.15, ease: 'power2.out' });
    gsap.to(cur2, { scale: 0.8, duration: 0.15, ease: 'power2.out' });
  });
  window.addEventListener('mouseup', () => {
    gsap.to(cur, { scale: 1, duration: 0.15, ease: 'power2.out' });
    gsap.to(cur2, { scale: 1, duration: 0.15, ease: 'power2.out' });
  });

  document.querySelectorAll(
    'button, a, .glass-card, .cc, .ec, .ms, .rc, .tw, .compcard, .cmarker, .tbtn, #indiaPath'
  ).forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cur, { scale: 3, opacity: 0.4, duration: 0.25, backgroundColor: '#ff9933', mixBlendMode: 'normal' });
      gsap.to(cur2, { scale: 1.5, borderColor: '#FFD700', duration: 0.25 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(cur, { scale: 1, opacity: 1, duration: 0.25, backgroundColor: '#ffffff', mixBlendMode: 'difference' });
      gsap.to(cur2, { scale: 1, borderColor: 'rgba(255,183,77,0.3)', duration: 0.25 });
    });
  });
}

// ════════════════════════════════════
// 2. PROGRESS BAR
// ════════════════════════════════════
const progressBar = document.getElementById('pb');
if (progressBar) {
  ScrollTrigger.create({
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: self => { progressBar.style.width = (self.progress * 100) + '%'; }
  });
}

// ════════════════════════════════════
// 3. TOPBAR LABEL + DOT RAIL
// ════════════════════════════════════
const topbarTitle = document.getElementById('sname');
const railLinks = document.querySelectorAll('.rail-dots a');
const railProgress = document.getElementById('railProgress');

function setActiveSection(id, label) {
  if (topbarTitle && label) topbarTitle.textContent = label;
  railLinks.forEach(a => {
    if (a.getAttribute('data-sec') === id) {
      a.classList.add('on');
      gsap.to(a, { '--dot-scale': 1.4, duration: 0.3, overwrite: 'auto' });
    } else {
      a.classList.remove('on');
      gsap.to(a, { '--dot-scale': 1, duration: 0.3, overwrite: 'auto' });
    }
  });
}

document.querySelectorAll('main .sec').forEach(sec => {
  const id = sec.id;
  const label = sec.getAttribute('data-label') ||
    (id === 'hero' ? 'Pre-Seed · Q4 2026' : '');
  ScrollTrigger.create({
    trigger: sec,
    start: 'top 45%',
    end: 'bottom 45%',
    onEnter: () => setActiveSection(id, label),
    onEnterBack: () => setActiveSection(id, label),
  });
});
setActiveSection('hero', 'Pre-Seed · Q4 2026');

// Rail Scroll Progress
if (railProgress) {
  ScrollTrigger.create({
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: self => { railProgress.style.height = (self.progress * 100) + '%'; }
  });
}

// Magnetic proximity effect for Rail
const railContainer = document.getElementById('rail');
if (railContainer && !isTouchDevice && !reduceMotion) {
  railContainer.addEventListener('mousemove', (e) => {
    const mouseY = e.clientY;
    railLinks.forEach(link => {
      if (link.classList.contains('on')) return; // skip active
      
      const rect = link.getBoundingClientRect();
      const linkCenterY = rect.top + rect.height / 2;
      const distance = Math.abs(mouseY - linkCenterY);
      const maxDist = 120;
      
      if (distance < maxDist) {
        const scale = 1 + 0.6 * (1 - Math.pow(distance / maxDist, 2)); // curve for smoother bulge
        gsap.to(link, { '--dot-scale': scale, duration: 0.1, overwrite: 'auto' });
      } else {
        gsap.to(link, { '--dot-scale': 1, duration: 0.2, overwrite: 'auto' });
      }
    });
  });
  
  railContainer.addEventListener('mouseleave', () => {
    railLinks.forEach(link => {
      if (!link.classList.contains('on')) {
        gsap.to(link, { '--dot-scale': 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      }
    });
  });
}

// ════════════════════════════════════
// 4. REVEAL-ON-SCROLL
// ════════════════════════════════════
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

document.querySelectorAll('.js-reveal, .js-reveal-left, .js-reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// ════════════════════════════════════
// 5. COUNT-UP NUMBERS
// ════════════════════════════════════
document.querySelectorAll('.count').forEach(el => {
  const target = parseFloat(el.getAttribute('data-count'));
  if (isNaN(target)) return;
  const prefix = el.getAttribute('data-prefix') || '';
  const suffix = el.getAttribute('data-suffix') || '';
  const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

  if (reduceMotion) {
    el.textContent = prefix + target.toFixed(decimals) + suffix;
    return;
  }

  const state = { v: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    once: true,
    onEnter: () => {
      gsap.to(state, {
        v: target,
        duration: 1.8,
        ease: 'power3.out',
        onUpdate: () => { el.textContent = prefix + state.v.toFixed(decimals) + suffix; }
      });
    }
  });
});

// ════════════════════════════════════
// 6. WORLD MAP — DOT-MATRIX BUILD + SWEEP DRAW-IN
// ════════════════════════════════════
(function () {
  const landG = document.getElementById('dotmap');
  const indiaG = document.getElementById('indiaDots');
  if (!landG || !indiaG || typeof MAP_DOTS === 'undefined') return;

  const NS = 'http://www.w3.org/2000/svg';
  const { cols, rows, cell, land, india } = MAP_DOTS;
  const hexw = Math.ceil(cols / 4);

  // One <g> per column so the reveal sweep animates 168 groups, not 6,000 dots
  const colGroups = [];
  for (let c = 0; c < cols; c++) {
    const g = document.createElementNS(NS, 'g');
    landG.appendChild(g);
    colGroups.push(g);
  }

  function rowBits(hex, r) { return BigInt('0x' + hex.substr(r * hexw, hexw)); }

  for (let r = 0; r < rows; r++) {
    const lb = rowBits(land, r), ib = rowBits(india, r);
    const cy = ((r + 0.5) * cell).toFixed(1);
    for (let c = 0; c < cols; c++) {
      const isIndia = (ib >> BigInt(c)) & 1n;
      const isLand = (lb >> BigInt(c)) & 1n;
      if (!isLand && !isIndia) continue;
      const d = document.createElementNS(NS, 'circle');
      d.setAttribute('cx', ((c + 0.5) * cell).toFixed(1));
      d.setAttribute('cy', cy);
      if (isIndia) {
        d.setAttribute('r', '2.5');
        indiaG.appendChild(d);
      } else {
        d.setAttribute('r', '1.7');
        colGroups[c].appendChild(d);
      }
    }
  }

  if (!reduceMotion) {
    gsap.set(colGroups, { opacity: 0 });
    gsap.set(indiaG, { opacity: 0 });
    const markers = ['#g-usa', '#g-ca', '#g-uk', '#g-cn'];
    markers.concat(['#g-in']).forEach(m => gsap.set(m, { opacity: 0, scale: 0.4, transformOrigin: 'center' }));

    const tl = gsap.timeline({
      scrollTrigger: { trigger: '#worldmap', start: 'top 78%', once: true }
    });
    tl.to(colGroups, { opacity: 1, duration: 0.5, ease: 'power1.out', stagger: 0.012 }) // west→east sweep
      .to(indiaG, { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.9')
      .to(markers, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.5)', stagger: 0.22 }, '-=0.4')
      .to('#g-in', { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(3)' }, '+=0.35');
  }
})();

// ════════════════════════════════════
// 7. DATA BARS
// ════════════════════════════════════
ScrollTrigger.create({
  trigger: '#bars',
  start: 'top 85%',
  once: true,
  onEnter: () => {
    const b1 = document.getElementById('b1');
    const b2 = document.getElementById('b2');
    if (b1) b1.style.width = '99%';
    if (b2) b2.style.width = '1%';
  }
});

// ════════════════════════════════════
// 8. BACKGROUND PARALLAX (data collection)
// ════════════════════════════════════
if (!reduceMotion) {
  gsap.to('#tcbg', {
    yPercent: -12,
    scrollTrigger: { trigger: '#traffic', start: 'top bottom', end: 'bottom top', scrub: 1.5 }
  });
}

// ════════════════════════════════════
// 9. HERO — SCATTER POINT CLOUD ON EXIT
// ════════════════════════════════════
ScrollTrigger.create({
  trigger: '#hero',
  start: 'top top',
  end: 'bottom top',
  scrub: 0.6,
  onUpdate: self => {
    if (window.NavixarHero) window.NavixarHero.setScroll(self.progress);
  }
});

// ════════════════════════════════════
// 10. WORLD MAP HOVER & CLICK CARDS
// ════════════════════════════════════
const cards = document.querySelectorAll('.ccard');
let activeCardId = null;

function showCard(cardId) {
  if (activeCardId === cardId && cardId !== null) {
    // If already active, toggle off
    cards.forEach(c => c.classList.remove('show'));
    activeCardId = null;
    return;
  }
  
  cards.forEach(c => c.classList.remove('show'));
  if (cardId) {
    const card = document.getElementById(cardId);
    if (card) {
      card.classList.add('show');
      const rect = card.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        card.style.left = 'auto';
        card.style.right = '24px';
      }
    }
    activeCardId = cardId;
  } else {
    activeCardId = null;
  }
}

document.querySelectorAll('.cmarker').forEach(marker => {
  const cardId = marker.getAttribute('data-card');

  marker.addEventListener('mouseenter', () => {
    if (window.matchMedia('(pointer: fine)').matches && !activeCardId) {
      const card = document.getElementById(cardId);
      if (card) card.classList.add('show');
      const dot = marker.querySelector('.dot');
      if (dot) gsap.to(dot, { scale: 1.3, duration: 0.2, ease: 'power2.out', transformOrigin: 'center' });
    }
  });

  marker.addEventListener('mouseleave', () => {
    if (window.matchMedia('(pointer: fine)').matches && !activeCardId) {
      const card = document.getElementById(cardId);
      if (card) card.classList.remove('show');
      const dot = marker.querySelector('.dot');
      if (dot) gsap.to(dot, { scale: 1, duration: 0.2, ease: 'power2.out' });
    }
  });

  marker.addEventListener('click', (e) => {
    e.stopPropagation();
    showCard(cardId);
  });
});

const indiaDots = document.getElementById('indiaDots');
if (indiaDots) {
  indiaDots.style.cursor = 'pointer';
  indiaDots.addEventListener('mouseenter', () => {
    if (window.matchMedia('(pointer: fine)').matches && !activeCardId) {
      const card = document.getElementById('card-in');
      if (card) card.classList.add('show');
      gsap.to(indiaDots, { fill: '#ff6b61', duration: 0.25 });
    }
  });
  indiaDots.addEventListener('mouseleave', () => {
    if (window.matchMedia('(pointer: fine)').matches && !activeCardId) {
      const card = document.getElementById('card-in');
      if (card) card.classList.remove('show');
      gsap.to(indiaDots, { fill: '#2997ff', duration: 0.35 });
    }
  });
  indiaDots.addEventListener('click', (e) => {
    e.stopPropagation();
    showCard('card-in');
  });
}

// Global click outside to dismiss cards
document.addEventListener('click', (e) => {
  if (!e.target.closest('.cmarker') && !e.target.closest('#indiaDots') && !e.target.closest('.ccard')) {
    if (activeCardId) {
      cards.forEach(c => c.classList.remove('show'));
      activeCardId = null;
    }
  }
});

// ════════════════════════════════════
// 11. SENSOR DIAGRAM SWITCH (ground vs drone capture)
// ════════════════════════════════════
window.setSensor = function (mode) {
  const stdBtn = document.getElementById('btn-std');
  const navBtn = document.getElementById('btn-nav');
  const statusChip = document.getElementById('statusChip');
  if (!stdBtn || !navBtn || !statusChip) return;

  stdBtn.classList.toggle('on', mode === 'std');
  navBtn.classList.toggle('on', mode === 'nav');

  const lblMl = document.getElementById('lbl-ml');
  const lblMr = document.getElementById('lbl-mr');

  if (mode === 'nav') {
    gsap.to('#zone-left', { duration: 0.4, ease: 'power2.out', attr: { fill: 'rgba(48,209,88,.12)', stroke: 'rgba(48,209,88,.4)' } });
    gsap.to('#zone-right', { duration: 0.4, ease: 'power2.out', attr: { fill: 'rgba(48,209,88,.12)', stroke: 'rgba(48,209,88,.4)' } });
    gsap.to('#det-ml', { attr: { stroke: 'rgba(48,209,88,.8)' }, duration: 0.3 });
    gsap.to('#det-mr', { attr: { stroke: 'rgba(48,209,88,.8)' }, duration: 0.3 });
    if (lblMl) { lblMl.textContent = 'DETECTED'; lblMl.setAttribute('fill', '#30d158'); }
    if (lblMr) { lblMr.textContent = 'DETECTED'; lblMr.setAttribute('fill', '#30d158'); }
    gsap.to('#sns-l', { attr: { opacity: 1 }, duration: 0.3, delay: 0.1 });
    gsap.to('#sns-r', { attr: { opacity: 1 }, duration: 0.3, delay: 0.1 });
    // Drone appears overhead with its capture cone
    gsap.to('#drone', { attr: { opacity: 1 }, duration: 0.45, ease: 'power2.out' });
    gsap.to('#drone-cone', { attr: { opacity: 1 }, duration: 0.6, delay: 0.15 });
    statusChip.textContent = 'Full 360° coverage — aerial view active';
    statusChip.className = 'status-chip good';
  } else {
    gsap.to('#zone-left', { duration: 0.4, ease: 'power2.out', attr: { fill: 'rgba(255,59,48,.12)', stroke: 'rgba(255,59,48,.4)' } });
    gsap.to('#zone-right', { duration: 0.4, ease: 'power2.out', attr: { fill: 'rgba(255,59,48,.12)', stroke: 'rgba(255,59,48,.4)' } });
    gsap.to('#det-ml', { attr: { stroke: 'rgba(255,59,48,.8)' }, duration: 0.3 });
    gsap.to('#det-mr', { attr: { stroke: 'rgba(255,59,48,.8)' }, duration: 0.3 });
    if (lblMl) { lblMl.textContent = 'BLIND SPOT'; lblMl.setAttribute('fill', '#ff453a'); }
    if (lblMr) { lblMr.textContent = 'BLIND SPOT'; lblMr.setAttribute('fill', '#ff453a'); }
    gsap.to('#sns-l', { attr: { opacity: 0 }, duration: 0.2 });
    gsap.to('#sns-r', { attr: { opacity: 0 }, duration: 0.2 });
    gsap.to('#drone', { attr: { opacity: 0 }, duration: 0.3 });
    gsap.to('#drone-cone', { attr: { opacity: 0 }, duration: 0.3 });
    statusChip.textContent = '2 vehicles undetected';
    statusChip.className = 'status-chip bad';
  }
};

// ════════════════════════════════════
// 12. ROADMAP TIMELINE — LINE DRAW + NODE LIGHT-UP
// ════════════════════════════════════
(function () {
  const fill = document.getElementById('tlfill');
  const items = document.querySelectorAll('.tl-item');
  if (!fill || !items.length) return;

  gsap.to(fill, {
    height: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: '#timeline',
      start: 'top 70%',
      end: 'bottom 55%',
      scrub: 0.5
    }
  });

  items.forEach(item => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 68%',
      onEnter: () => item.classList.add('lit'),
      onLeaveBack: () => item.classList.remove('lit')
    });
  });
})();

// ════════════════════════════════════
// 13. USE-OF-FUNDS BARS + PCT COUNT
// ════════════════════════════════════
ScrollTrigger.create({
  trigger: '#funds',
  start: 'top 78%',
  once: true,
  onEnter: () => {
    document.querySelectorAll('#funds .fund-fill').forEach((bar, i) => {
      const w = bar.getAttribute('data-w') || 0;
      gsap.to(bar, { width: w + '%', duration: 1.4, delay: i * 0.12, ease: 'power3.out' });
    });
    document.querySelectorAll('#funds .fund-pct').forEach((el, i) => {
      const target = parseInt(el.getAttribute('data-pct'), 10) || 0;
      if (reduceMotion) { el.textContent = target + '%'; return; }
      const state = { v: 0 };
      gsap.to(state, {
        v: target, duration: 1.4, delay: i * 0.12, ease: 'power3.out',
        onUpdate: () => { el.textContent = Math.round(state.v) + '%'; }
      });
    });
  }
});

// ════════════════════════════════════
// 14. INTERACTIVE SPLAT PLAYGROUND (2D canvas)
// ════════════════════════════════════
const canvas = document.getElementById('splatCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let mode = 'wireframe';
  let trafficCount = 0;
  let particles = [];
  let vehicles = [];
  let mouse = { x: 0, y: 0 };
  let time = 0;

  function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    initScene();
  }
  window.addEventListener('resize', resizeCanvas);

  function initScene() {
    particles = [];
    vehicles = [];
    trafficCount = 0;
    for (let x = -500; x <= 500; x += 30) {
      for (let z = -500; z <= 500; z += 30) {
        if (Math.random() > 0.05) {
          particles.push({
            ox: x, oz: z,
            y: (Math.random() * 10 - 5),
            color: `hsl(${220 + Math.random() * 20}, 20%, ${30 + Math.random() * 20}%)`
          });
        }
      }
    }
  }

  window.setSimMode = function (newMode) {
    mode = newMode;
    document.getElementById('btn-wireframe').classList.toggle('active', mode === 'wireframe');
    document.getElementById('btn-splat').classList.toggle('active', mode === 'splat');
    const status = document.getElementById('sim-status');
    status.textContent = mode === 'wireframe'
      ? 'Rendering structured lanes & basic polygons...'
      : 'Gaussian Splat Mode: Rendering raw unstructured environment data...';
  };

  window.addTraffic = function () {
    trafficCount++;
    vehicles.push({
      x: (Math.random() - 0.5) * 800,
      z: 500 + Math.random() * 200,
      speed: 2 + Math.random() * 4,
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.05,
      color: Math.random() > 0.7 ? '#f59e0b' : '#38bdf8'
    });
    document.getElementById('sim-status').textContent = `Traffic added. Entities active: ${trafficCount}`;
  };

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left - width / 2;
    mouse.y = e.clientY - rect.top - height / 2;
  });

  function project(x, y, z) {
    const camZ = -600, fov = 400;
    const px = x - (mouse.x * 0.5);
    const py = y - 100 - (mouse.y * 0.5);
    const pz = z - camZ;
    if (pz <= 0) return null;
    const scale = fov / pz;
    return { x: width / 2 + px * scale, y: height / 2 + py * scale, scale };
  }

  let simVisible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { simVisible = entries[0].isIntersecting; }, { threshold: 0 })
      .observe(canvas);
  }

  function draw() {
    requestAnimationFrame(draw);
    if (!simVisible) return;
    ctx.clearRect(0, 0, width, height);
    time += 0.01;

    const movingForward = time * 200;
    let renderList = [];

    particles.forEach(p => {
      let z = (p.oz - movingForward) % 1000;
      if (z < -500) z += 1000;
      const proj = project(p.ox, p.y, z);
      if (proj) renderList.push({ ...proj, isSplat: true, color: p.color });
    });

    vehicles.forEach(v => {
      v.z -= v.speed;
      v.x += Math.sin(time * 50 * v.wobbleSpeed + v.wobbleOffset) * 2;
      if (v.z < -500) v.z = 500 + Math.random() * 200;
      const proj = project(v.x, -10, v.z);
      if (proj) renderList.push({ ...proj, isVehicle: true, v });
    });

    renderList.sort((a, b) => b.scale - a.scale);

    if (mode === 'wireframe') {
      ctx.strokeStyle = 'rgba(0, 113, 227, 0.4)';
      ctx.lineWidth = 1;
      for (let z = -400; z <= 400; z += 100) {
        let dz = (z - movingForward) % 1000;
        if (dz < -500) dz += 1000;
        const p1 = project(-500, 0, dz), p2 = project(500, 0, dz);
        if (p1 && p2) { ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); }
      }
      for (let x = -400; x <= 400; x += 100) {
        const p1 = project(x, 0, -400), p2 = project(x, 0, 400);
        if (p1 && p2) { ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); }
      }
    } else {
      renderList.forEach(item => {
        if (item.isSplat) {
          const distToMouse = Math.hypot(item.x - (width / 2 + mouse.x), item.y - (height / 2 + mouse.y));
          const glow = Math.max(0, 1 - distToMouse / 200);
          ctx.beginPath();
          ctx.arc(item.x, item.y, Math.max(0.5, item.scale * 8), 0, Math.PI * 2);
          ctx.fillStyle = glow > 0.1 ? `hsl(140, 80%, ${50 + glow * 30}%)` : item.color;
          ctx.fill();
        }
      });
    }

    renderList.forEach(item => {
      if (item.isVehicle) {
        const r = Math.max(2, item.scale * 20);
        if (mode === 'wireframe') {
          ctx.strokeStyle = item.v.color;
          ctx.lineWidth = 2;
          ctx.strokeRect(item.x - r, item.y - r, r * 2, r * 2);
        } else {
          ctx.fillStyle = item.v.color;
          ctx.shadowColor = item.v.color;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(item.x, item.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.fillRect(item.x - 2, item.y - 2, 4, 4);
        }
      }
    });
  }

  setTimeout(() => { resizeCanvas(); draw(); }, 100);
}

// ════════════════════════════════════
// 15. "EXPLAIN LIKE I'M 10" — ONE TOGGLE PER SECTION
// ════════════════════════════════════
(function () {
  const ELI10 = {
    hero: {
      emoji: '🚕',
      text: `A <strong>robotaxi</strong> is a taxi with no driver — the car watches the road with cameras and drives you itself, like a very careful robot chauffeur. Rich countries already have thousands of them. Nobody has built one that can handle India's wonderfully wild roads. We want to be the first.`
    },
    market: {
      emoji: '🗺️',
      text: `The glowing dots are countries where robot taxis <strong>already drive around every day</strong>. See the red ✕? That's India — millions of taxi rides a day, and not a single robot taxi. It's like every city in the world got an ice-cream shop except the city with the most kids. We're opening that shop.`
    },
    thesis: {
      emoji: '📖',
      text: `The <strong>recipe</strong> for making a car drive itself used to be a big secret. Now it's basically in free cookbooks anyone can read. But you can't download the <strong>ingredients</strong>: what Indian roads actually look like — the cows, the potholes, the traffic. Whoever collects those ingredients first wins. That's our whole plan.`
    },
    problem: {
      emoji: '🎮',
      text: `Robot cars learned to drive in America, where roads are neat and everyone stays in their lane. Indian roads are a completely different game — like a player who only ever practiced the easy level suddenly getting dropped into the <strong>hardest level in the world</strong>. The robot has to learn India first, from scratch.`
    },
    datagap: {
      emoji: '📼',
      text: `Robot cars learn by watching millions of hours of driving videos — the way you get better at a game by playing it a lot. But <strong>99 out of every 100 videos</strong> they've watched are from America or Europe. Almost none show a cow crossing, an auto squeezing through a gap, or five bikes sharing one lane. We're going to film India for them.`
    },
    traffic: {
      emoji: '🚁',
      text: `How do we film all of India's traffic without buying thousands of cars? Three tricks: <strong>1)</strong> flying drones watch the road from above, like a bird that never blinks. <strong>2)</strong> we made a game where players drive through real Indian streets — every move secretly teaches our robot. <strong>3)</strong> we buy videos from little cameras people already have in their cars. Fast, cheap, clever.`
    },
    simulation: {
      emoji: '🕹️',
      text: `Before our robot drives a real street, it practices inside a <strong>video-game copy</strong> of that street — because crashing in a game is free! Old game-worlds look like LEGO: too fake to trust. Our trick (called <strong>Gaussian splats</strong>) builds the game world out of real photos, so it looks exactly like the real street — potholes, glare, chaos and all.`
    },
    simenv: {
      emoji: '🐄',
      text: `We're building the practice-world specifically for India: bumpy roads, cows that wander in, autos that squeeze into impossible gaps, people crossing wherever they like. And there's a game version — when you play it, <strong>you're secretly teaching our robot how Indians drive</strong>. Every player becomes a teacher.`
    },
    team: {
      emoji: '🧑‍🔧',
      text: `Our founder has spent <strong>7 years doing exactly one thing</strong>: collecting driving data and building practice-worlds for India's biggest car companies. He's not guessing this will work — companies have already paid him to do it, again and again. Now he's building the whole robot, not just the homework.`
    },
    momentum: {
      emoji: '🏁',
      text: `The starting gun already fired. Robot taxis carry <strong>half a million people a week</strong> in America. Ten thousand robot delivery vans roll through China every day. The UN even wrote the official rulebook. Everyone is running the race — and India's lane is still completely empty. That empty lane is ours.`
    },
    marketsize: {
      emoji: '🇮🇳',
      text: `Every single day, Indians take <strong>3 million+ taxi rides</strong> — imagine a queue of customers stretching across the whole country, already waiting. And how many robot taxis serve them today? <strong>Zero.</strong> The first one to show up gets the whole queue.`
    },
    vision: {
      emoji: '💰',
      text: `One robot brain, <strong>six ways to earn</strong>: run robo-taxis, rent the brain to car companies, sell our India driving videos, help smart cities, take it to other countries with wild traffic, and rent out our practice-world. If one lemonade stand has a slow day, five others are still selling.`
    },
    tailwinds: {
      emoji: '🌬️',
      text: `Lots of things are pushing us forward, like wind at your back on a bicycle: India has brilliant engineers who want exactly this job, electric cars are everywhere, the government just wrote rules <strong>allowing</strong> robot cars, and computers get cheaper every year. We picked the perfect moment to start pedalling.`
    },
    roadmap: {
      emoji: '🗓️',
      text: `Our plan works like game levels. <strong>Level 1:</strong> get the money and the team. <strong>Level 2:</strong> collect a million kilometres of Indian driving video. <strong>Level 3:</strong> build the practice-world. <strong>Level 4:</strong> teach the robot brain. <strong>Boss level:</strong> a real car drives itself on a test track — then we raise more money to go bigger.`
    },
    ask: {
      emoji: '🫙',
      text: `We're asking investors for the first pot of money. Most of it pays brilliant engineers; the rest buys driving videos, drones, and computer power. In exchange, investors own a <strong>slice of the company</strong> — and if the robot-taxi dream works, that slice becomes worth much, much more.`
    }
  };

  function buildToggle(sec, conf) {
    // Button
    const btn = document.createElement('button');
    btn.className = 'eli10-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `<span class="e-ico">🧒</span><span class="e-lbl">Explain it like I'm 10</span>`;

    // Panel
    const panel = document.createElement('div');
    panel.className = 'eli10';
    panel.innerHTML = `
      <div class="eli10-clip">
        <div class="eli10-card">
          <div class="eli10-tag"><span>${conf.emoji}</span> The 10-year-old version</div>
          <p>${conf.text}</p>
        </div>
      </div>`;

    // Placement: button joins the chapter row (or hero statement), panel follows the intro copy
    const chapterRow = sec.querySelector('.chapter');
    const anchor = sec.querySelector('.inner .sub') || sec.querySelector('.hstmt') || sec.querySelector('.inner .headline') || sec.querySelector('.inner');

    if (chapterRow) chapterRow.appendChild(btn);
    else if (sec.id === 'hero') {
      const pills = sec.querySelector('.hpills');
      if (pills) pills.appendChild(btn);
    }
    if (anchor) anchor.insertAdjacentElement('afterend', panel);

    btn.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      btn.classList.toggle('on', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('.e-lbl').textContent = open ? 'Back to investor mode' : "Explain it like I'm 10";
      setTimeout(() => ScrollTrigger.refresh(), 650);
    });
  }

  document.querySelectorAll('main .sec').forEach(sec => {
    const conf = ELI10[sec.id];
    if (conf) buildToggle(sec, conf);
  });
})();

// ════════════════════════════════════
// 16. RESIZE
// ════════════════════════════════════
window.addEventListener('resize', () => ScrollTrigger.refresh());
