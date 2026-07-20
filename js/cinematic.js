/* ─── Navixar · Cinematic Kit (no dependencies) ───
   Configure per page BEFORE loading this file:
   window.CINE = {
     boot: ['line 1', 'line 2', 'line 3'],   // omit for no boot overlay
     bootKey: 'nvx-boot-x',                  // sessionStorage: show once per session
     road: true,                              // inject top progress road (skip if page has #pb)
     tilt: '.selector, .list',                // 3D tilt cards
     grain: true                               // film grain + vignette
   } */
(function () {
  'use strict';
  const CFG = window.CINE || {};
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const mobile = window.matchMedia('(max-width: 860px)').matches;

  /* ═══ BOOT OVERLAY ═══ */
  if (CFG.boot && !reduce) {
    let seen = false;
    try { seen = !!sessionStorage.getItem(CFG.bootKey || 'nvx-boot'); } catch (e) {}
    if (!seen) {
      try { sessionStorage.setItem(CFG.bootKey || 'nvx-boot', '1'); } catch (e) {}
      const boot = document.createElement('div');
      boot.id = 'cine-boot';
      boot.setAttribute('aria-hidden', 'true');
      const wrap = document.createElement('div');
      CFG.boot.forEach((txt, i) => {
        const l = document.createElement('div');
        l.className = 'bline' + (i === CFG.boot.length - 1 ? ' bcaret' : '');
        l.textContent = '> ' + txt;
        wrap.appendChild(l);
        setTimeout(() => l.classList.add('on'), 150 + i * 380);
      });
      boot.appendChild(wrap);
      document.body.appendChild(boot);
      const kill = () => { boot.classList.add('gone'); setTimeout(() => boot.remove(), 600); };
      setTimeout(kill, 1650);
      boot.addEventListener('click', kill);
    }
  }

  /* ═══ GRAIN + VIGNETTE ═══ */
  if (CFG.grain !== false) {
    const g = document.createElement('div'); g.id = 'cine-grain';
    const v = document.createElement('div'); v.id = 'cine-vig';
    document.body.appendChild(v); document.body.appendChild(g);
  }

  /* ═══ PROGRESS ROAD ═══ */
  if (CFG.road) {
    const r = document.createElement('div'); r.id = 'cine-road';
    r.innerHTML = '<div class="fill"><div class="car"></div></div>';
    document.body.appendChild(r);
    const fill = r.querySelector('.fill');
    let tick = false;
    function road() {
      const h = document.documentElement;
      fill.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100).toFixed(2) + '%';
      tick = false;
    }
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(road); } }, { passive: true });
    road();
  }

  /* ═══ SCRAMBLE DECODE · [data-scramble] ═══ */
  const CHARS = '▪▫◧◨01ADXZ$#';
  document.querySelectorAll('[data-scramble]').forEach(el => {
    if (reduce) return;
    const fin = el.textContent;
    const delay = parseInt(el.dataset.scramble || '0', 10);
    const sio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; sio.disconnect();
      setTimeout(() => {
        const t0 = performance.now(), dur = 900;
        (function tick(t) {
          const p = Math.min(1, (t - t0) / dur);
          const solved = Math.floor(fin.length * p);
          let out = fin.slice(0, solved);
          for (let i = solved; i < fin.length; i++) out += fin[i] === ' ' ? ' ' : CHARS[(Math.random() * CHARS.length) | 0];
          el.textContent = out;
          if (p < 1) requestAnimationFrame(tick); else el.textContent = fin;
        })(t0);
      }, delay);
    }), { threshold: 0.5 });
    sio.observe(el);
  });

  /* ═══ LIVE COUNTERS · [data-live-rate] (units per second) ═══ */
  const lives = document.querySelectorAll('[data-live-rate]');
  if (lives.length) {
    const t0 = performance.now();
    setInterval(() => {
      const sec = (performance.now() - t0) / 1000;
      lives.forEach(el => {
        el.textContent = Math.floor(sec * parseFloat(el.dataset.liveRate)).toLocaleString('en-IN');
      });
    }, 120);
  }

  /* ═══ COUNT-UPS · .cnum[data-count] (skips pages with their own) ═══ */
  document.querySelectorAll('.cnum[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; cio.disconnect();
      if (reduce) { el.textContent = pre + end.toFixed(dec) + suf; return; }
      const t0 = performance.now(), dur = 1600;
      (function tick(t) {
        const p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + (end * ease).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }), { threshold: 0.6 });
    cio.observe(el);
  });

  /* ═══ PROOF LINES · .cin-line stagger ═══ */
  const linesAll = document.querySelectorAll('.cin-line');
  if (linesAll.length) {
    const lio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const group = e.target.parentElement.querySelectorAll('.cin-line');
      group.forEach((l, i) => setTimeout(() => l.classList.add('on'), i * 180));
      group.forEach(l => lio.unobserve(l));
    }), { threshold: 0.25 });
    linesAll.forEach(l => lio.observe(l));
  }

  /* ═══ NEON FLICKER · [data-flick] ═══ */
  document.querySelectorAll('[data-flick]').forEach(el => {
    const fio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { el.classList.add('cin-flick'); fio.disconnect(); }
    }), { threshold: 0.6 });
    fio.observe(el);
  });

  /* ═══ TILT + GLARE ═══ */
  if (CFG.tilt && fine && !reduce && !mobile) {
    document.querySelectorAll(CFG.tilt).forEach(card => {
      card.classList.add('cin-tilt');
      const cs = getComputedStyle(card);
      if (cs.position === 'static') card.style.position = 'relative';
      const glare = document.createElement('span');
      glare.className = 'cin-glare';
      card.appendChild(glare);
      card.addEventListener('pointermove', e => {
        const b = card.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
        card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 7).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 9).toFixed(2) + 'deg) translateY(-4px)';
        card.style.setProperty('--gx', (px * 100) + '%');
        card.style.setProperty('--gy', (py * 100) + '%');
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ═══ MAGNETIC PRIMARY CTAs ═══ */
  if (fine && !reduce && !mobile) {
    document.querySelectorAll('.btn.primary').forEach(cta => {
      cta.addEventListener('pointermove', e => {
        const b = cta.getBoundingClientRect();
        const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
        cta.style.transform = 'translate(' + dx * 0.18 + 'px,' + (dy * 0.24 - 2) + 'px)';
      });
      cta.addEventListener('pointerleave', () => { cta.style.transform = ''; });
    });
  }

  /* Perception reticle removed: it hijacked the cursor and made large
     interactive sections hard to use. Native cursor + #cur/#cur2 remain. */
})();
