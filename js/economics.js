/* ─── Navixar — Economics Branch Interactivity ───
   1. TAM/SAM/SOM pyramid hover
   2. Unit economics live model
   3. Revenue ladder accordion
   4. Milestone assumption cards
   5. Return path comps chart
*/
(function () {
  'use strict';

  /* ════════════════════════════════════
     1. TAM PYRAMID
  ════════════════════════════════════ */
  const tamStack = document.getElementById('tamStack');
  const tamDetail = document.getElementById('tamDetail');
  if (tamStack && tamDetail) {
    tamStack.querySelectorAll('.tam-layer').forEach(layer => {
      const show = () => {
        tamDetail.style.opacity = '0';
        setTimeout(() => {
          tamDetail.innerHTML = layer.dataset.detail;
          tamDetail.style.opacity = '1';
        }, 120);
      };
      layer.addEventListener('mouseenter', show);
      layer.addEventListener('click', show);
    });
  }

  /* ════════════════════════════════════
     2. UNIT ECONOMICS MODEL
     Human ride: platform capped at 20% (MVAG 2025).
     Driver's 80% covers fuel, EMI/maintenance, and take-home.
     Autonomous: EV energy + amortised vehicle + maintenance
     + compute/remote-ops + insurance.
     All figures ₹/km, illustrative.
  ════════════════════════════════════ */
  const ueFare = document.getElementById('ueFare');
  const ueVeh = document.getElementById('ueVeh');
  const ueKm = document.getElementById('ueKm');

  if (ueFare && ueVeh && ueKm) {
    const C = {
      humanFuel: 5.5,        // driver-paid fuel (petrol/CNG mix), ₹/km
      humanVehicle: 4.0,     // driver-paid EMI + maintenance + insurance, ₹/km
      evEnergy: 1.3,         // EV charging, ₹/km
      autoMaint: 1.8,        // maintenance + cleaning, ₹/km
      autoCompute: 1.5,      // compute, connectivity, remote supervision, ₹/km
      autoInsurance: 0.8,    // fleet insurance, ₹/km
      vehicleLifeKm: 250000  // amortisation base
    };
    const COLORS = {
      platform: '#2997ff', fuel: '#ff9f0a', vehicle: '#8e8e93', takehome: '#e91e63',
      energy: '#30d158', amort: '#0071e3', maint: '#8e8e93', compute: '#bf5af2',
      insurance: '#64d2ff', margin: '#30d158'
    };

    function seg(label, value, color, total, striped) {
      const pct = Math.max((value / total) * 100, 0);
      const bg = striped
        ? 'repeating-linear-gradient(45deg,' + color + '55,' + color + '55 5px,' + color + '22 5px,' + color + '22 10px)'
        : color + 'cc';
      return '<div class="ue-seg" style="width:' + pct + '%;background:' + bg + '" title="' + label + ': ₹' + value.toFixed(1) + '/km">' +
        (pct > 11 ? '<span>₹' + value.toFixed(1) + '</span>' : '') + '</div>';
    }
    function legend(items) {
      return items.map(i =>
        '<div class="ue-leg-item"><span class="ue-leg-dot" style="background:' + i[1] + '"></span>' + i[0] + '</div>'
      ).join('');
    }

    function render() {
      const fare = +ueFare.value;          // ₹/km
      const vehL = +ueVeh.value;           // lakh ₹
      const kmDay = +ueKm.value;

      document.getElementById('ueFareVal').textContent = '₹' + fare + '/km';
      document.getElementById('ueVehVal').textContent = '₹' + vehL + 'L';
      document.getElementById('ueKmVal').textContent = kmDay + ' km/day';

      /* Human ride: platform 20%, driver 80% (pays fuel + vehicle out of it) */
      const platform = fare * 0.20;
      const driverGross = fare * 0.80;
      const takeHome = Math.max(driverGross - C.humanFuel - C.humanVehicle, 0);

      document.getElementById('ueBarHuman').innerHTML =
        seg('Platform (20% cap)', platform, COLORS.platform, fare) +
        seg('Fuel — paid by driver', C.humanFuel, COLORS.fuel, fare) +
        seg('Vehicle EMI + upkeep — paid by driver', C.humanVehicle, COLORS.vehicle, fare) +
        seg('Driver take-home', takeHome, COLORS.takehome, fare);
      document.getElementById('ueLegendHuman').innerHTML = legend([
        ['Platform (20% cap)', COLORS.platform],
        ['Fuel · driver pays', COLORS.fuel],
        ['Vehicle EMI + upkeep · driver pays', COLORS.vehicle],
        ['Driver take-home', COLORS.takehome]
      ]);

      /* Autonomous ride */
      const amort = (vehL * 100000) / C.vehicleLifeKm;
      const autoCost = C.evEnergy + amort + C.autoMaint + C.autoCompute + C.autoInsurance;
      const margin = fare - autoCost;
      const marginPct = (margin / fare) * 100;

      document.getElementById('ueBarAuto').innerHTML =
        seg('EV energy', C.evEnergy, COLORS.energy, fare) +
        seg('Vehicle + sensors (amortised)', amort, COLORS.amort, fare) +
        seg('Maintenance + cleaning', C.autoMaint, COLORS.maint, fare) +
        seg('Compute + remote ops', C.autoCompute, COLORS.compute, fare) +
        seg('Insurance', C.autoInsurance, COLORS.insurance, fare) +
        seg('Margin', Math.max(margin, 0), COLORS.margin, fare, true);
      document.getElementById('ueLegendAuto').innerHTML = legend([
        ['EV energy', COLORS.energy],
        ['Vehicle + sensors, amortised', COLORS.amort],
        ['Maintenance + cleaning', COLORS.maint],
        ['Compute + remote ops', COLORS.compute],
        ['Insurance', COLORS.insurance],
        ['Margin', COLORS.margin]
      ]);

      /* Readouts */
      const cashCostPerKm = C.evEnergy + C.autoMaint + C.autoCompute + C.autoInsurance;
      const dailyCash = (fare - cashCostPerKm) * kmDay;
      const paybackMonths = (vehL * 100000) / dailyCash / 30.4;

      document.getElementById('roCost').textContent = '₹' + autoCost.toFixed(1) + '/km';
      const roMargin = document.getElementById('roMargin');
      const roPct = document.getElementById('roPct');
      roMargin.textContent = (margin < 0 ? '−' : '') + '₹' + Math.abs(margin).toFixed(1) + '/km';
      roPct.textContent = marginPct.toFixed(0) + '%';
      roMargin.classList.toggle('good', margin > 0);
      roPct.classList.toggle('good', margin > 0);
      document.getElementById('roPayback').textContent = paybackMonths.toFixed(0) + ' months';

      /* Benchmark line */
      const multiple = platform > 0 ? (margin / platform) : 0;
      document.getElementById('ueBenchmark').innerHTML =
        margin > 0
          ? 'At these settings a Navixar ride earns <strong>₹' + margin.toFixed(1) + '/km</strong> — <strong>' +
            multiple.toFixed(1) + '×</strong> the ₹' + platform.toFixed(1) + '/km an aggregator can legally earn on a human-driven ride. ' +
            'Or: undercut today’s fare by <strong>' + Math.min(marginPct, 99).toFixed(0) + '%</strong> and still break even — a price no human-driven fleet can follow.'
          : 'At these settings the ride loses money — push utilisation up or vehicle cost down. This honesty is the point: the model shows exactly which assumptions matter.';
    }

    ['input', 'change'].forEach(ev => {
      ueFare.addEventListener(ev, render);
      ueVeh.addEventListener(ev, render);
      ueKm.addEventListener(ev, render);
    });
    render();
  }

  /* ════════════════════════════════════
     3. REVENUE LADDER ACCORDION
  ════════════════════════════════════ */
  document.querySelectorAll('.ladder-rung .lr-head').forEach(head => {
    head.addEventListener('click', () => {
      const rung = head.parentElement;
      const wasOpen = rung.classList.contains('open');
      document.querySelectorAll('.ladder-rung').forEach(r => r.classList.remove('open'));
      if (!wasOpen) rung.classList.add('open');
      if (typeof ScrollTrigger !== 'undefined') setTimeout(() => ScrollTrigger.refresh(), 500);
    });
  });

  /* ════════════════════════════════════
     4. MILESTONE ASSUMPTION CARDS
  ════════════════════════════════════ */
  document.querySelectorAll('.mm-card').forEach(card => {
    card.addEventListener('click', () => {
      card.dataset.open = card.dataset.open === 'true' ? 'false' : 'true';
      if (typeof ScrollTrigger !== 'undefined') setTimeout(() => ScrollTrigger.refresh(), 450);
    });
  });

  /* ════════════════════════════════════
     5. RETURN PATH CHART
  ════════════════════════════════════ */
  const rpChart = document.getElementById('rpChart');
  const rpNote = document.getElementById('rpNote');
  if (rpChart) {
    let animated = false;
    const animate = () => {
      if (animated) return;
      animated = true;
      rpChart.querySelectorAll('.rp-fill').forEach((f, i) => {
        setTimeout(() => { f.style.width = f.dataset.w + '%'; }, i * 130);
      });
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries, obs) => {
        entries.forEach(e => { if (e.isIntersecting) { animate(); obs.disconnect(); } });
      }, { threshold: 0.3 }).observe(rpChart);
    } else animate();

    if (rpNote) {
      rpChart.querySelectorAll('.rp-row').forEach(row => {
        row.addEventListener('mouseenter', () => { rpNote.textContent = row.dataset.note; });
        row.addEventListener('click', () => { rpNote.textContent = row.dataset.note; });
      });
    }
  }
})();
