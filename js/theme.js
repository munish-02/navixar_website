/* ─── Navixar — Theme Toggle + Clickable Citations ─── */
(function () {
  'use strict';

  /* ════════════════════════════════════
     1. LIGHT / DARK TOGGLE
     (initial theme is applied by the inline
      head snippet to avoid a flash)
  ════════════════════════════════════ */
  const btn = document.getElementById('themeToggle');
  function label() {
    const light = document.documentElement.dataset.theme === 'light';
    if (btn) btn.innerHTML = light
      ? '<span class="tt-icon">☾</span> DARK'
      : '<span class="tt-icon">☀</span> LIGHT';
  }
  if (btn) {
    btn.addEventListener('click', () => {
      const html = document.documentElement;
      const next = html.dataset.theme === 'light' ? 'dark' : 'light';
      html.dataset.theme = next;
      try { localStorage.setItem('nvx-theme', next); } catch (e) {}
      label();
    });
    label();
  }

  /* ════════════════════════════════════
     2. CLICKABLE CITATIONS
     Scans every .src / .mss / .twtag element, splits on '·',
     and links any segment that matches a known source.
  ════════════════════════════════════ */
  const SOURCES = [
    ['mordor', 'https://www.mordorintelligence.com/industry-reports/india-taxi-market'],
    ['mobility foresights', 'https://mobilityforesights.com/product/india-autonomous-trucks-market'],
    ['goldman', 'https://www.goldmansachs.com/insights/articles/robotaxis-to-become-a-400-billion-dollar-market-in-2035'],
    ['grand view', 'https://www.grandviewresearch.com/horizon/outlook/autonomous-vehicle-market/india'],
    ['truckmitr', 'https://truckmitr.com/blog/india%E2%80%99s_growing_truck_driver-_sortage'],
    ['iru', 'https://www.iru.org/news-resources/newsroom/driver-shortage-trucking-industry-india-perspective'],
    ['mvag', 'https://restofworld.org/2025/uber-india-price-war/'],
    ['morgan stanley', 'https://research.contrary.com/company/waymo'],
    ['bloomberg', 'https://www.bloomberg.com/news/articles/2026-06-29/gm-backed-self-driving-firm-momenta-seeks-752-million-from-hong-kong-listing'],
    ['reuters', 'https://www.investing.com/news/stock-market-news/chinas-momenta-seeks-up-to-751-million-in-hong-kong-ipo-to-boost-autonomous-driving-rd-4764186'],
    ['momenta prospectus', 'https://cnevpost.com/2026/06/29/momenta-hk-ipo-seeking-750-million/'],
    ['momenta hk', 'https://www.bloomberg.com/news/articles/2026-06-29/gm-backed-self-driving-firm-momenta-seeks-752-million-from-hong-kong-listing'],
    ['siam', 'https://www.siam.in/statistics.aspx'],
    ['wayve', 'https://techcrunch.com/2026/06/30/wayve-launches-85m-employee-tender-offer-at-8-5b-valuation/'],
    ['waabi', 'https://waabi.ai/newsroom/'],
    ['techcrunch', 'https://techcrunch.com/2026/06/30/wayve-launches-85m-employee-tender-offer-at-8-5b-valuation/'],
    ['pony', 'https://stockanalysis.com/stocks/pony/statistics/'],
    ['weride', 'https://stockanalysis.com/stocks/wrd/market-cap/'],
    ['nasdaq', 'https://stockanalysis.com/stocks/pony/statistics/'],
    ['waymo valuation', 'https://research.contrary.com/company/waymo'],
    ['waymo/nhtsa', 'https://waymo.com/safety/'],
    ['crunchbase', 'https://news.crunchbase.com/sections/transportation/'],
    ['morths', 'https://morth.nic.in/'],
    ['ola/uber', 'https://www.statista.com/outlook/mmo/shared-mobility/ride-hailing/india/'],
    ['statista', 'https://www.statista.com/outlook/mmo/shared-mobility/ride-hailing/india/'],
    ['unece', 'https://unece.org/transport/vehicle-regulations'],
    ['zoox', 'https://zoox.com/journal'],
    ['bolt', 'https://bolt.eu/en/press/'],
    ['loxo', 'https://www.loxo.ch/'],
    ['a3 market', 'https://www.automate.org/'],
    ['nvidia', 'https://developer.nvidia.com/blog/'],
    ['cesium', 'https://cesium.com/blog/']
  ];

  function linkFor(text) {
    const t = text.toLowerCase();
    for (let i = 0; i < SOURCES.length; i++) {
      if (t.indexOf(SOURCES[i][0]) !== -1) return SOURCES[i][1];
    }
    return null;
  }
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  document.querySelectorAll('.src, .mss, .twtag').forEach(el => {
    const raw = el.textContent;
    // preserve "Source:" / "Sources:" prefix outside the links
    const m = raw.match(/^(\s*Sources?:\s*)([\s\S]*)$/i);
    const prefix = m ? m[1] : '';
    const body = m ? m[2] : raw;
    let changed = false;
    const html = body.split('·').map(seg => {
      const url = linkFor(seg);
      if (!url) return esc(seg);
      changed = true;
      return '<a class="cite-link" href="' + url + '" target="_blank" rel="noopener" title="Open source in a new tab">' + esc(seg.trim()) + '</a>';
    }).join(' · ');
    if (changed) el.innerHTML = esc(prefix) + html;
  });
})();
