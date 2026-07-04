/* ─── Navixar — Interactive Systems ───
   1. Quiz gate (unlocks the Thesis)
   2. Pillar particle-assembly animation
   3. Point-cloud cow (datagap edge case)
   4. Roadmap guess-the-timeline game
   5. Interactive budget calculator (the Ask)
*/
(function () {
  'use strict';
  const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ════════════════════════════════════
     1. QUIZ GATE — "Why is this not in India?"
  ════════════════════════════════════ */
  const thesis = document.getElementById('thesis');
  const quizGrid = document.getElementById('quizGrid');
  const statusText = document.getElementById('quizStatusText');
  const qpDots = [document.getElementById('qpd1'), document.getElementById('qpd2')];
  let unlocked = false;

  function miniBurst(x, y) {
    const colors = ['#0071e3', '#2997ff', '#30d158', '#ff9933', '#FFD700'];
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'nvx-burst';
      const a = (Math.PI * 2 * i) / 24 + Math.random() * 0.4;
      const d = 60 + Math.random() * 160;
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--bx', Math.cos(a) * d + 'px');
      p.style.setProperty('--by', Math.sin(a) * d + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1400);
    }
  }

  function unlockThesis(withFanfare, scrollTo) {
    if (unlocked || !thesis) return;
    unlocked = true;
    try { sessionStorage.setItem('nvx-thesis-unlocked', '1'); } catch (e) {}
    thesis.classList.remove('gated');
    thesis.classList.add('unlocking');
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    if (scrollTo) setTimeout(() => thesis.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'start' }), withFanfare ? 700 : 100);
    assemblePillars();
  }

  if (quizGrid && thesis) {
    let already = false;
    try { already = sessionStorage.getItem('nvx-thesis-unlocked') === '1'; } catch (e) {}
    if (already) {
      thesis.classList.remove('gated');
      unlocked = true;
      setTimeout(assemblePillars, 100);
      quizGrid.querySelectorAll('.quiz-opt[data-correct="true"]').forEach(o => o.classList.add('locked-in'));
      if (statusText) statusText.textContent = 'Already solved — Data and Validation. Scroll on.';
      qpDots.forEach(d => d && d.classList.add('lit'));
    }

    let correctCount = already ? 2 : 0;

    quizGrid.querySelectorAll('.quiz-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        if (unlocked || opt.classList.contains('locked-in') || opt.classList.contains('cooling')) return;
        const isCorrect = opt.getAttribute('data-correct') === 'true';
        const why = opt.getAttribute('data-why') || '';
        const verdict = opt.querySelector('.qo-verdict');

        if (isCorrect) {
          opt.classList.add('locked-in');
          if (verdict) verdict.textContent = '✓ ' + why;
          correctCount++;
          if (qpDots[correctCount - 1]) qpDots[correctCount - 1].classList.add('lit');
          const r = opt.getBoundingClientRect();
          if (!rm) miniBurst(r.left + r.width / 2, r.top + r.height / 2);

          if (correctCount >= 2) {
            if (statusText) statusText.innerHTML = '<strong>Exactly. Data and Validation.</strong> The tech is table stakes — the moat is Indian. Loading our thesis…';
            document.getElementById('whynot').classList.add('solved');
            unlockThesis(true, true);
          } else {
            if (statusText) statusText.textContent = 'One down. One to go.';
          }
        } else {
          opt.classList.add('wrong', 'cooling');
          if (verdict) verdict.textContent = '✕ ' + why;
          if (statusText) statusText.textContent = 'Not quite — that one is getting easier every year.';
          setTimeout(() => { opt.classList.remove('wrong'); }, 2600);
          setTimeout(() => { opt.classList.remove('cooling'); const v = opt.querySelector('.qo-verdict'); if (v) v.textContent = ''; }, 4000);
        }
      });
    });

    const skip = document.getElementById('quizSkip');
    if (skip) skip.addEventListener('click', () => {
      quizGrid.querySelectorAll('.quiz-opt[data-correct="true"]').forEach(o => {
        o.classList.add('locked-in');
        const v = o.querySelector('.qo-verdict');
        if (v) v.textContent = '✓ ' + (o.getAttribute('data-why') || '');
      });
      qpDots.forEach(d => d && d.classList.add('lit'));
      if (statusText) statusText.innerHTML = '<strong>The answer: Indian Data + Testing &amp; Validation.</strong> Here\'s why that\'s the whole company…';
      unlockThesis(false, true);
    });

    // Rail link to a gated thesis routes to the question instead
    const thesisRail = document.querySelector('.rail-dots a[data-sec="thesis"]');
    if (thesisRail) thesisRail.addEventListener('click', (e) => {
      if (!unlocked) {
        e.preventDefault();
        document.getElementById('whynot').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ════════════════════════════════════
     2. PILLARS — points converge into the three cards
  ════════════════════════════════════ */
  let pillarsAssembled = false;
  function assemblePillars() {
    if (pillarsAssembled || !thesis) return;
    const grid = thesis.querySelector('.egrid');
    const cards = grid ? grid.querySelectorAll('.ec') : [];
    if (!grid || !cards.length) return;
    pillarsAssembled = true;

    if (rm || typeof gsap === 'undefined') {
      cards.forEach(c => { c.style.opacity = 1; });
      return;
    }

    grid.style.position = 'relative';
    gsap.set(cards, { opacity: 0, scale: 0.92, y: 20 });

    const run = () => {
      const gRect = grid.getBoundingClientRect();
      const layer = document.createElement('div');
      layer.className = 'pillar-dust';
      grid.appendChild(layer);

      const tl = gsap.timeline({ onComplete: () => setTimeout(() => layer.remove(), 800) });

      cards.forEach((card, ci) => {
        const cRect = card.getBoundingClientRect();
        const cx = cRect.left - gRect.left, cy = cRect.top - gRect.top;
        const dots = [];
        for (let i = 0; i < 42; i++) {
          const d = document.createElement('div');
          d.className = 'pd-dot';
          // start: scattered around the whole grid
          const sx = Math.random() * gRect.width;
          const sy = -80 + Math.random() * (gRect.height + 160);
          // end: on the card — border-biased so the "pillar" outline forms first
          let ex, ey;
          if (i % 3 === 0) { // top/bottom edge
            ex = cx + Math.random() * cRect.width;
            ey = cy + (Math.random() < 0.5 ? 0 : cRect.height);
          } else if (i % 3 === 1) { // left/right edge
            ex = cx + (Math.random() < 0.5 ? 0 : cRect.width);
            ey = cy + Math.random() * cRect.height;
          } else { // interior, where the text lives
            ex = cx + cRect.width * (0.15 + Math.random() * 0.7);
            ey = cy + cRect.height * (0.12 + Math.random() * 0.5);
          }
          d.style.transform = `translate(${sx}px, ${sy}px)`;
          layer.appendChild(d);
          dots.push({ el: d, ex, ey });
        }
        tl.to(dots.map(o => o.el), {
          x: (i) => dots[i].ex, y: (i) => dots[i].ey,
          xPercent: 0, yPercent: 0,
          duration: 0.9, ease: 'power3.inOut',
          stagger: 0.012,
          onStart: function () { dots.forEach(o => { o.el.style.left = '0px'; o.el.style.top = '0px'; }); }
        }, ci * 0.28)
          .to(card, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.6)' }, ci * 0.28 + 0.75)
          .to(dots.map(o => o.el), { opacity: 0, duration: 0.4 }, ci * 0.28 + 0.95);
      });
    };

    // run when the grid is actually on screen
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { io.disconnect(); run(); }
      }, { threshold: 0.15 });
      io.observe(grid);
    } else run();
  }

  /* ════════════════════════════════════
     3. POINT-CLOUD COW — the edge case, made of data
  ════════════════════════════════════ */
  const cowCanvas = document.getElementById('cowCanvas');
  if (cowCanvas && typeof COW_POINTS !== 'undefined') {
    const wrap = document.getElementById('cow-cloud-wrap');
    const label = document.getElementById('cow-label');
    const ctx = cowCanvas.getContext('2d');
    let W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);

    function size() {
      W = wrap.clientWidth; H = wrap.clientHeight;
      cowCanvas.width = W * dpr; cowCanvas.height = H * dpr;
      cowCanvas.style.width = W + 'px'; cowCanvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size);

    const COW_H = 170;           // rendered cow height px
    const SPEED = 130;           // px/sec — a cow with somewhere to be
    let visible = false;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(wrap);

    let t0 = null;
    function frame(ts) {
      requestAnimationFrame(frame);
      if (!visible || rm) { t0 = ts; if (rm) drawCow(W * 0.5, ts || 0); return; }
      if (t0 === null) t0 = ts;
      const t = (ts - t0) / 1000;
      const span = W + COW_H * 2.4;
      // walks right → left (the cow faces left), loops forever.
      // Starts 70% of the way across the screen so it's on stage the moment you arrive.
      const x = W + COW_H * 1.2 - ((W * 0.55 + t * SPEED) % span);
      drawCow(x, ts);
    }

    function drawCow(cowX, ts) {
      ctx.clearRect(0, 0, W, H);
      const s = COW_H;                         // square sprite, aspect 1
      const baseY = H - COW_H - 6;
      const bob = Math.sin(ts / 280) * 2.5;    // gentle walking bob

      // bounding box (perception overlay)
      const bx = cowX + s * 0.08, by = baseY + s * 0.18 + bob, bw = s * 0.84, bh = s * 0.62;
      ctx.strokeStyle = 'rgba(41,151,255,.55)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 5]);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.setLineDash([]);
      // corner ticks
      ctx.strokeStyle = 'rgba(41,151,255,.9)';
      ctx.lineWidth = 2;
      [[bx, by], [bx + bw, by], [bx, by + bh], [bx + bw, by + bh]].forEach(([px, py], i) => {
        const dx = i % 2 === 0 ? 1 : -1, dy = i < 2 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(px + dx * 10, py); ctx.lineTo(px, py); ctx.lineTo(px, py + dy * 10); ctx.stroke();
      });

      // the cow, as a living point cloud
      for (let i = 0; i < COW_POINTS.length; i++) {
        const p = COW_POINTS[i];
        const jx = Math.sin(ts / 300 + i * 1.7) * 1.1;
        const jy = Math.cos(ts / 260 + i * 2.3) * 1.1;
        // legs (lower third) swing a little as it walks
        const legSwing = p[1] > 0.62 ? Math.sin(ts / 220 + p[0] * 9) * (p[1] - 0.62) * 16 : 0;
        const x = cowX + p[0] * s + jx + legSwing;
        const y = baseY + p[1] * s + jy + bob;
        const lum = p[2];
        const flicker = 0.55 + 0.45 * Math.sin(ts / 500 + i);
        ctx.fillStyle = i % 11 === 0
          ? `rgba(255,153,51,${0.5 + 0.4 * flicker})`                    // saffron sparks
          : `rgba(${120 + lum * 135}, ${170 + lum * 85}, 255, ${0.35 + lum * 0.5})`;
        ctx.fillRect(x, y, 1.8, 1.8);
      }

      // label follows the cow
      if (label) {
        const lx = Math.min(Math.max(cowX + s * 0.9 + 14, 8), W - 300);
        label.style.transform = `translate(${lx}px, ${baseY + s * 0.2}px)`;
      }
    }
    requestAnimationFrame(frame);
  }

  /* ════════════════════════════════════
     4. ROADMAP — guess the timeline
  ════════════════════════════════════ */
  (function () {
    const items = document.querySelectorAll('#timeline .tl-item[data-actual]');
    if (!items.length) return;
    const OPTIONS = ['Q4 2026', 'Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027', '2028+'];
    const qIndex = o => OPTIONS.indexOf(o);
    const scoreEl = document.getElementById('rmScore');
    const summary = document.getElementById('rmSummary');
    const sumBig = document.getElementById('rmsBig');
    const sumText = document.getElementById('rmsText');
    let guessed = 0, spotOn = 0, totalDelta = 0;

    function revealItem(item, pickedIdx) {
      const actual = item.getAttribute('data-actual');
      const ai = qIndex(actual);
      const dateEl = item.querySelector('.tl-date');
      const verdict = item.querySelector('.tg-verdict');
      const chips = item.querySelectorAll('.tg-chip');
      item.classList.add('guessed');
      dateEl.textContent = actual;
      dateEl.classList.add('td-revealed');
      chips.forEach((c, i) => {
        c.disabled = true;
        if (i === ai) c.classList.add('actual');
        if (pickedIdx !== null && i === pickedIdx && i !== ai) c.classList.add('missed');
      });
      if (verdict) {
        if (pickedIdx === null) verdict.textContent = '';
        else if (pickedIdx === ai) { verdict.textContent = 'Spot on. That\'s the plan.'; verdict.className = 'tg-verdict hit'; spotOn++; }
        else if (pickedIdx > ai) { verdict.textContent = `Faster than you guessed — ${actual}.`; verdict.className = 'tg-verdict fast'; }
        else { verdict.textContent = `Love the ambition — plan says ${actual}.`; verdict.className = 'tg-verdict slow'; }
        if (pickedIdx !== null) totalDelta += (pickedIdx - ai);
      }
      guessed++;
      if (scoreEl) scoreEl.textContent = `${guessed} / ${items.length} guessed`;
      if (guessed >= items.length) finish();
    }

    function finish() {
      if (!summary) return;
      summary.classList.add('show');
      const months = 12; // Q4 2026 → Q4 2027
      if (sumBig) sumBig.textContent = spotOn > 0 ? `${spotOn}/${items.length} spot on` : 'Raise → Road: 12 months';
      if (sumText) {
        sumText.innerHTML = totalDelta > 0
          ? `You expected this to take longer. Most people do — that's the point. <strong>Pre-seed to closed-course autonomy in ${months} months</strong>, because the data pipeline is crowdsourced, the validation is simulated, and India's talent density makes this cadence possible.`
          : `You believe in the pace — good, because we're committing to it. <strong>Pre-seed to closed-course autonomy in ${months} months</strong>, milestone-gated so every phase de-risks the next.`;
      }
      if (typeof ScrollTrigger !== 'undefined') setTimeout(() => ScrollTrigger.refresh(), 500);
    }

    items.forEach(item => {
      const holder = item.querySelector('.tg-chips');
      if (!holder) return;
      OPTIONS.forEach((opt, i) => {
        const b = document.createElement('button');
        b.className = 'tg-chip';
        b.textContent = opt;
        b.addEventListener('click', () => { if (!item.classList.contains('guessed')) revealItem(item, i); });
        holder.appendChild(b);
      });
    });

    const revealAll = document.getElementById('rmRevealAll');
    if (revealAll) revealAll.addEventListener('click', () => {
      items.forEach(item => { if (!item.classList.contains('guessed')) revealItem(item, null); });
      if (sumBig) sumBig.textContent = 'Raise → Road: 12 months';
      if (sumText) sumText.innerHTML = '<strong>Pre-seed to closed-course autonomy in 12 months</strong> — crowdsourced data, simulated validation, milestone-gated spending. Every phase de-risks the next.';
    });
  })();

  /* ════════════════════════════════════
     5. THE ASK — interactive budget
  ════════════════════════════════════ */
  (function () {
    const wrap = document.getElementById('funds');
    if (!wrap || !wrap.classList.contains('budget-wrap')) return;

    const state = { eng: 1000, bot: 150, train: 500, data: 500, sim: 500, ops: 100 };
    const BUFFER_RATE = 0.15;
    const INR_RATE = 85;

    const fmt = k => k >= 1000 ? '$' + (k / 1000).toFixed(k % 1000 === 0 ? 1 : 2) + 'M' : '$' + Math.round(k) + 'k';

    function recompute(animate) {
      const subtotal = state.eng + state.bot + state.train + state.data + state.sim + state.ops;
      const buffer = Math.round(subtotal * BUFFER_RATE);
      const total = subtotal + buffer;

      // row amounts + bars
      wrap.querySelectorAll('.brow-item').forEach(row => {
        const key = row.getAttribute('data-key');
        const amt = key === 'buffer' ? buffer : state[key];
        if (amt === undefined) return;
        const amtEl = row.querySelector('.bi-amt');
        const fill = row.querySelector('.bi-fill');
        if (amtEl) amtEl.textContent = fmt(amt);
        if (fill) {
          const w = (amt / total * 100).toFixed(1) + '%';
          if (animate && typeof gsap !== 'undefined' && !rm) gsap.to(fill, { width: w, duration: 0.8, ease: 'power3.out' });
          else fill.style.width = w;
        }
      });

      // summary
      const totalM = '$' + (total / 1000).toFixed(2) + 'M';
      const totalShort = '$' + (total / 1000).toFixed(1) + 'M';
      const inrCr = '≈ ₹' + Math.round(total * INR_RATE / 10000) + ' Cr';
      const bsTotal = document.getElementById('bsTotal');
      const bsInr = document.getElementById('bsInr');
      if (bsTotal) bsTotal.textContent = totalM;
      if (bsInr) bsInr.innerHTML = inrCr + ' <em>(at ₹' + INR_RATE + '/$)</em>';
      const head = document.getElementById('askTotalHead');
      const cta = document.getElementById('ctaTotal');
      if (head) head.textContent = totalShort;
      if (cta) cta.textContent = totalShort;

      // impact list
      const hits = [];
      wrap.querySelectorAll('.bi-toggle').forEach(tg => {
        const on = tg.querySelector('.bt-opt.on');
        if (on && on.getAttribute('data-hit')) hits.push(on.getAttribute('data-hit'));
      });
      const list = document.getElementById('bsHitsList');
      if (list) {
        list.innerHTML = hits.length
          ? hits.map(h => `<div class="bs-hit">${h}</div>`).join('')
          : '<div class="bs-hit none">Nothing — this is the recommended configuration.</div>';
      }
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }

    wrap.querySelectorAll('.bi-toggle').forEach(tg => {
      const key = tg.getAttribute('data-toggle');
      tg.querySelectorAll('.bt-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.classList.contains('on')) return;
          tg.querySelectorAll('.bt-opt').forEach(b => b.classList.remove('on'));
          btn.classList.add('on');
          state[key] = parseFloat(btn.getAttribute('data-cost'));
          recompute(true);
          if (!rm && typeof gsap !== 'undefined') {
            gsap.fromTo('#bsTotal', { scale: 1.12 }, { scale: 1, duration: 0.5, ease: 'power2.out', clearProps: 'scale' });
          }
        });
      });
    });

    // first paint + reveal animation
    recompute(false);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => {
        if (es[0].isIntersecting) {
          io.disconnect();
          wrap.querySelectorAll('.bi-fill').forEach(f => { const w = f.style.width; f.style.width = '0%'; requestAnimationFrame(() => { if (typeof gsap !== 'undefined' && !rm) gsap.to(f, { width: w, duration: 1.2, ease: 'power3.out' }); else f.style.width = w; }); });
          const rw = document.getElementById('bsRunwayFill');
          if (rw) setTimeout(() => { rw.style.width = '100%'; }, 300);
        }
      }, { threshold: 0.2 });
      io.observe(wrap);
    }
  })();

  /* ════════════════════════════════════
     6. ATTRACTION LAYER — badges + nudges on everything playable
  ════════════════════════════════════ */
  (function () {
    function addBadge(anchorEl, label, position) {
      if (!anchorEl) return null;
      const b = document.createElement('div');
      b.className = 'try-badge';
      b.innerHTML = `<span class="tb-dot"></span><span>${label}</span><span class="tb-hand">👆</span>`;
      anchorEl.insertAdjacentElement(position || 'beforebegin', b);
      return b;
    }
    const done = (badge) => { if (badge) badge.classList.add('done'); };

    // Quiz
    const quizBadge = addBadge(document.getElementById('quizGrid'), 'Interactive · Pick your two answers');
    const qg = document.getElementById('quizGrid');
    if (qg) qg.addEventListener('click', () => done(quizBadge), { once: true });

    // Sensor diagram (drone toggle)
    const sensorBar = document.querySelector('.sensor-diagram .toggle-bar');
    const sensorBadge = addBadge(sensorBar, 'Interactive · Toggle the drone');
    if (sensorBar) sensorBar.addEventListener('click', () => {
      done(sensorBadge);
      const sd = document.querySelector('.sensor-diagram');
      if (sd) sd.classList.add('interacted');
    }, { once: true });

    // Splat playground
    const simControls = document.querySelector('#interactive-sim .sim-controls');
    const simBadge = addBadge(document.getElementById('interactive-sim'), 'Interactive · Switch renderers, add chaos');
    if (simControls) simControls.addEventListener('click', () => {
      done(simBadge);
      const is = document.getElementById('interactive-sim');
      if (is) is.classList.add('interacted');
    }, { once: true });

    // Roadmap game
    const rmBadge = addBadge(document.getElementById('rmScorebar'), 'Interactive · Guess every date');
    const tlEl = document.getElementById('timeline');
    if (tlEl) tlEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('tg-chip')) done(rmBadge);
    });

    // Budget toggles
    const budgetBadge = addBadge(document.querySelector('.budget-wrap'), 'Interactive · Flip the toggles, watch the money move');
    document.querySelectorAll('.bi-toggle').forEach(tg => {
      tg.classList.add('untouched');
      tg.addEventListener('click', () => {
        tg.classList.remove('untouched');
        done(budgetBadge);
      }, { once: true });
    });
  })();

})();
