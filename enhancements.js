/* ============================================================
   Apex Community Hub — enhancements.js
   Additional features: dark mode, A-Z sort, keyboard shortcuts,
   map interactions, print buttons, breadcrumbs, service worker
   ============================================================ */

/* ── Dark Mode Toggle ── */
(function () {
  const toggle = document.getElementById('darkToggle');
  if (!toggle) return;
  const saved = localStorage.getItem('apexTheme') || '';
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggle.textContent = '☀️ Light';
  }
  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', '');
      localStorage.setItem('apexTheme', '');
      toggle.textContent = '🌙 Dark';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('apexTheme', 'dark');
      toggle.textContent = '☀️ Light';
    }
  });
})();

/* ── Keyboard Shortcut: / focuses search ── */
(function () {
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      const searchEl =
        document.getElementById('heroSearchInput') ||
        document.getElementById('searchInput') ||
        document.getElementById('dirSearchInput');
      if (searchEl) {
        searchEl.focus();
        searchEl.select();
      }
    }
  });
})();

/* ── A-Z Sort for Directory ── */
(function () {
  const grid = document.getElementById('directory-list') || document.querySelector('.resource-grid');
  if (!grid) return;

  // Inject sort toolbar if on directory page
  const toolbar = document.querySelector('.dir-toolbar');
  if (!toolbar) return;

  let sortMode = 'default';
  const originalOrder = Array.from(grid.children);

  const azBtn = document.getElementById('sortAZBtn');
  const zaBtn = document.getElementById('sortZABtn');
  const defBtn = document.getElementById('sortDefaultBtn');

  function sortCards(mode) {
    const cards = Array.from(grid.children);
    if (mode === 'az') {
      cards.sort((a, b) => {
        const an = a.querySelector('h3')?.textContent.trim() || '';
        const bn = b.querySelector('h3')?.textContent.trim() || '';
        return an.localeCompare(bn);
      });
    } else if (mode === 'za') {
      cards.sort((a, b) => {
        const an = a.querySelector('h3')?.textContent.trim() || '';
        const bn = b.querySelector('h3')?.textContent.trim() || '';
        return bn.localeCompare(an);
      });
    } else {
      // restore original order
      originalOrder.forEach(c => grid.appendChild(c));
      return;
    }
    cards.forEach(c => grid.appendChild(c));
  }

  [azBtn, zaBtn, defBtn].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      [azBtn, zaBtn, defBtn].forEach(b => b?.classList.remove('active'));
      btn.classList.add('active');
      sortMode = btn.dataset.sort;
      sortCards(sortMode);
    });
  });
})();

/* ── Interactive Wake County Map ── */
(function () {
  const mapInfo = document.getElementById('mapInfo');
  const mapTooltip = document.getElementById('mapTooltip');
  if (!mapInfo) return;

  document.querySelectorAll('.map-dot').forEach(dot => {
    const name = dot.dataset.name || '';
    const info = dot.dataset.info || '';

    dot.addEventListener('mouseenter', e => {
      mapInfo.innerHTML = `
        <strong style="color:var(--navy);font-size:.92rem;">${name}</strong>
        <p style="font-size:.82rem;margin:.3rem 0 0;">${info}</p>
      `;
      if (mapTooltip) {
        mapTooltip.textContent = name;
        mapTooltip.style.display = 'block';
        mapTooltip.style.left = (e.clientX + 12) + 'px';
        mapTooltip.style.top = (e.clientY - 32) + 'px';
      }
    });
    dot.addEventListener('mousemove', e => {
      if (mapTooltip) {
        mapTooltip.style.left = (e.clientX + 12) + 'px';
        mapTooltip.style.top = (e.clientY - 32) + 'px';
      }
    });
    dot.addEventListener('mouseleave', () => {
      if (mapTooltip) mapTooltip.style.display = 'none';
    });
    dot.addEventListener('focus', () => {
      mapInfo.innerHTML = `
        <strong style="color:var(--navy);font-size:.92rem;">${name}</strong>
        <p style="font-size:.82rem;margin:.3rem 0 0;">${info}</p>
      `;
    });
    dot.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        mapInfo.innerHTML = `
          <strong style="color:var(--navy);font-size:.92rem;">${name}</strong>
          <p style="font-size:.82rem;margin:.3rem 0 0;">${info}</p>
        `;
      }
    });
  });
})();

/* ── Print Resource Button ── */
(function () {
  document.querySelectorAll('.featured-print-btn, .print-resource-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      window.print();
    });
  });
  // Also handle inline print triggers
  const printDirBtn = document.getElementById('printDirBtn');
  if (printDirBtn) printDirBtn.addEventListener('click', () => window.print());
})();

/* ── Directory URL-driven filter (from quick access buttons) ── */
(function () {
  const params = new URLSearchParams(window.location.search);
  const filter = params.get('filter');
  if (filter) {
    const btn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
    if (btn) {
      setTimeout(() => btn.click(), 100);
    }
  }
})();

/* ── Animated Impact Counters ── */
(function () {
  const statEls = document.querySelectorAll('.impact-num[data-target]');
  if (!statEls.length) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateImpact(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    if (reducedMotion) {
      el.textContent = (target >= 10000 ? target.toLocaleString() : target) + suffix;
      return;
    }
    const duration = 1600;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;
      el.textContent = (current >= 10000 ? Math.round(current).toLocaleString() : Math.round(current)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateImpact(entry.target); io.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  statEls.forEach(el => io.observe(el));
})();

/* ── Update all nav headers to include Events page ── */
(function () {
  // Add dark toggle to any page that has navToggle but no darkToggle yet
  const existingToggle = document.getElementById('darkToggle');
  if (!existingToggle) {
    const navInner = document.querySelector('.nav-inner');
    if (navInner) {
      const dt = document.createElement('button');
      dt.id = 'darkToggle';
      dt.className = 'dark-toggle';
      dt.setAttribute('aria-label', 'Toggle dark mode');
      dt.textContent = '🌙 Dark';
      const navToggle = document.getElementById('navToggle');
      if (navToggle) navInner.insertBefore(dt, navToggle);
      else navInner.appendChild(dt);

      const saved = localStorage.getItem('apexTheme') || '';
      if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        dt.textContent = '☀️ Light';
      }
      dt.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
        localStorage.setItem('apexTheme', isDark ? '' : 'dark');
        dt.textContent = isDark ? '🌙 Dark' : '☀️ Light';
      });
    }
  }
  // Persist theme on page load for pages without dedicated toggle handling
  const theme = localStorage.getItem('apexTheme');
  if (theme === 'dark' && document.documentElement.getAttribute('data-theme') !== 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const dt = document.getElementById('darkToggle');
    if (dt) dt.textContent = '☀️ Light';
  }
})();

/* ── Skip link visibility polish ── */
(function() {
  // Ensure emergency strip has aria-label
  const strip = document.querySelector('.emergency-strip');
  if (strip && !strip.hasAttribute('aria-label')) {
    strip.setAttribute('aria-label', 'Emergency information');
  }
})();

/* ── Service Worker Registration ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(() => {}); // fail silently if blocked
  });
}
