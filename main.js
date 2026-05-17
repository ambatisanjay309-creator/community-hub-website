/* ============================================================
   Apex Community Hub — main.js
   Apex High School TSA Webmaster Team
   ============================================================ */

/* ── Mobile Nav Toggle ── */
(function () {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    const spans = toggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
})();

/* ── Active Nav Link ── */
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── Scroll Reveal (IntersectionObserver) ── */
(function () {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ── Parallax Hero / Section ── */
(function () {
  const parallaxImgs = document.querySelectorAll('.parallax-img');
  if (!parallaxImgs.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let ticking = false;
  function updateParallax() {
    parallaxImgs.forEach(img => {
      const wrap = img.closest('.parallax-wrap') || img.parentElement;
      const rect = wrap.getBoundingClientRect();
      const viewH = window.innerHeight;
      const progress = 1 - (rect.bottom / (viewH + rect.height));
      const offset = (progress - 0.5) * 60;
      img.style.transform = `translateY(${offset}px)`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }, { passive: true });
  updateParallax();
})();

/* ── Lazy Image Loading with shimmer → fade-in ── */
(function () {
  const imgs = document.querySelectorAll('img[data-src]');
  if (imgs.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        img.addEventListener('load',  () => img.classList.add('loaded'), { once: true });
        img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
        io.unobserve(img);
      });
    }, { rootMargin: '200px' });
    imgs.forEach(img => io.observe(img));
  }
  document.querySelectorAll('img:not([data-src])').forEach(img => {
    if (img.complete) { img.classList.add('loaded'); }
    else {
      img.addEventListener('load',  () => img.classList.add('loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
    }
  });
})();

/* ── Animated Stat Counters ── */
(function () {
  const statEls = document.querySelectorAll('.stat-num[data-target]');
  if (!statEls.length) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const isInt  = Number.isInteger(target);
    if (reducedMotion) { el.textContent = prefix + (isInt ? target : target.toFixed(1)) + suffix; return; }
    const duration = 1400;
    const start    = performance.now();
    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const current  = target * ease;
      el.textContent = prefix + (isInt ? Math.round(current) : current.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); io.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  statEls.forEach(el => io.observe(el));
})();

/* ── Resource Directory: Search + Filter ── */
(function () {
  const searchInput = document.getElementById('searchInput');
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const cards       = document.querySelectorAll('.resource-card');
  const countEl     = document.getElementById('resourceCount');
  const noResults   = document.getElementById('noResults');
  if (!cards.length) return;

  let activeFilter = 'all';
  let query = '';

  function applyFilters() {
    let visible = 0;
    cards.forEach(card => {
      const cat        = (card.dataset.category || '').toLowerCase();
      const text       = card.textContent.toLowerCase();
      const matchCat   = activeFilter === 'all' || cat === activeFilter;
      const matchQuery = !query || text.includes(query);
      if (matchCat && matchQuery) {
        card.style.display = '';
        card.classList.remove('revealed');
        requestAnimationFrame(() => card.classList.add('revealed'));
        visible++;
      } else {
        card.style.display = 'none';
      }
    });
    if (countEl) countEl.textContent = `Showing ${visible} resource${visible !== 1 ? 's' : ''}`;
    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
  }

  if (searchInput) {
    searchInput.addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); applyFilters(); });
  }
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || 'all';
      applyFilters();
    });
  });

  const dirSearchInput = document.getElementById('dirSearchInput');
  if (dirSearchInput) {
    dirSearchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        query = dirSearchInput.value.trim().toLowerCase();
        if (searchInput) searchInput.value = dirSearchInput.value;
        applyFilters();
        document.getElementById('directory-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        query = dirSearchInput.value.trim().toLowerCase();
        if (searchInput) searchInput.value = dirSearchInput.value;
        applyFilters();
        document.getElementById('directory-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }
  applyFilters();
})();

/* ── Submit Resource Form — Formspree + Validation ── */
(function () {
  const form = document.getElementById('submitForm');
  if (!form) return;
  const successAlert = document.getElementById('successAlert');
  const errorAlert   = document.getElementById('errorAlert');
  const submitBtn    = form.querySelector('[type="submit"]');

  function showError(input, msgId, msg) {
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    const el = document.getElementById(msgId);
    if (el) { el.textContent = msg; el.classList.add('show'); }
  }
  function clearError(input, msgId) {
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
    const el = document.getElementById(msgId);
    if (el) el.classList.remove('show');
  }

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('error');
      field.setAttribute('aria-invalid', 'false');
      const errEl = document.getElementById(field.id + 'Error');
      if (errEl) errEl.classList.remove('show');
    });
  });

  function isValidURL(str)   { if (!str) return true; try { new URL(str); return true; } catch { return false; } }
  function isValidEmail(str) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str); }
  function isValidPhone(str) { if (!str) return true; return /^[\d\s\-().+]{7,}$/.test(str); }

  function validateForm() {
    let valid = true;
    const fields = {
      orgName:        { el: form.querySelector('#orgName'),        errId: 'orgNameError',        required: true,  msg: 'Organization name is required.' },
      category:       { el: form.querySelector('#category'),       errId: 'categoryError',       required: true,  msg: 'Please select a category.' },
      description:    { el: form.querySelector('#description'),    errId: 'descriptionError',    required: true,  msg: 'A description of at least 20 characters is required.', minLen: 20 },
      location:       { el: form.querySelector('#location'),       errId: 'locationError',       required: true,  msg: 'Location or service area is required.' },
      contactPhone:   { el: form.querySelector('#contactPhone'),   errId: 'contactPhoneError',   required: false, phone: true },
      contactEmail:   { el: form.querySelector('#contactEmail'),   errId: 'contactEmailError',   required: false, email: true },
      website:        { el: form.querySelector('#website'),        errId: 'websiteError',        required: false, url: true },
      submitterName:  { el: form.querySelector('#submitterName'),  errId: 'submitterNameError',  required: true,  msg: 'Your name is required.' },
      submitterEmail: { el: form.querySelector('#submitterEmail'), errId: 'submitterEmailError', required: true,  email: true, msg: 'A valid email address is required.' },
    };
    Object.values(fields).forEach(f => {
      if (!f.el) return;
      const val = f.el.value.trim();
      clearError(f.el, f.errId);
      if (f.required && !val)                          { showError(f.el, f.errId, f.msg || 'This field is required.'); valid = false; }
      else if (f.minLen && val.length < f.minLen)      { showError(f.el, f.errId, f.msg); valid = false; }
      else if (f.email && val && !isValidEmail(val))   { showError(f.el, f.errId, 'Please enter a valid email address.'); valid = false; }
      else if (f.phone && val && !isValidPhone(val))   { showError(f.el, f.errId, 'Please enter a valid phone number.'); valid = false; }
      else if (f.url   && val && !isValidURL(val))     { showError(f.el, f.errId, 'Please enter a valid URL (e.g., https://example.org).'); valid = false; }
    });
    return valid;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    successAlert.classList.remove('show');
    errorAlert.classList.remove('show');
    if (!validateForm()) {
      errorAlert.classList.add('show');
      form.querySelector('.error')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    const origText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting…';
    submitBtn.disabled = true;
    try {
      const response = await fetch('https://formspree.io/f/xrbkjrov', {
        method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' }
      });
      successAlert.classList.add('show');
      form.reset();
      successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch {
      successAlert.classList.add('show');
      form.reset();
      successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      submitBtn.textContent = origText;
      submitBtn.disabled = false;
    }
  });

  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      form.querySelectorAll('[aria-invalid]').forEach(el => el.setAttribute('aria-invalid', 'false'));
      form.querySelectorAll('.field-error').forEach(el => el.classList.remove('show'));
      successAlert.classList.remove('show');
      errorAlert.classList.remove('show');
    });
  }
})();

/* ── Design Brief Sidebar Active ── */
(function () {
  const sections = document.querySelectorAll('.brief-section');
  const navLinks = document.querySelectorAll('.brief-nav a');
  if (!sections.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => observer.observe(s));
})();

/* ── Smooth Scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ── Hero search redirect to directory ── */
(function () {
  const heroSearch = document.getElementById('heroSearchInput');
  const heroBtn    = document.getElementById('heroSearchBtn');
  if (!heroSearch || !heroBtn) return;
  function goToDirectory() {
    const q = heroSearch.value.trim();
    window.location.href = 'directory.html' + (q ? '?q=' + encodeURIComponent(q) : '');
  }
  heroBtn.addEventListener('click', goToDirectory);
  heroSearch.addEventListener('keydown', e => { if (e.key === 'Enter') goToDirectory(); });
})();

/* ── Directory: pre-fill search from URL ── */
(function () {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    const input = document.getElementById('searchInput');
    if (input) { input.value = q; input.dispatchEvent(new Event('input')); }
    const dirInput = document.getElementById('dirSearchInput');
    if (dirInput) dirInput.value = q;
  }
})();

/* ── Sticky header shadow on scroll ── */
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10
      ? '0 2px 24px rgba(26,46,74,.14)'
      : '0 1px 4px rgba(26,46,74,.08)';
  }, { passive: true });
})();

/* ── Community Assistant Chatbot (local knowledge base) ── */
(function () {
  const KB = [
    { keys: ['emergency','911','fire','police','ems','ambulance','urgent','crisis','danger','help now','right now','immediately'], answer: '🚨 For any emergency, call 911 immediately.\n\nFor non-emergency situations:\n• Apex Police (non-emergency): (919) 362-8661\n• Apex Fire (non-emergency): (919) 362-8553\n• Wake County EMS (non-emergency): (919) 856-6480\n• Mental health crisis: (800) 510-9132 (Alliance Health, 24/7)\n\nYou can also dial 2-1-1 any time to be connected with a live social services specialist.' },
    { keys: ['food','hungry','hunger','pantry','meal','eat','groceries','snap','wic','nutrition','food bank','food assistance'], answer: '🥫 Food resources in the Apex / Wake County area:\n\n• Food Bank of Central & Eastern NC — 3 Solar Ct, Morrisville · (919) 460-7900 · foodbankcenc.org\n• Apex Food Pantry — contact through Apex United Methodist Church or dial 2-1-1 for the nearest distribution site\n• SNAP & WIC enrollment — Wake County Human Services: (919) 212-7000\n• NC 211 — Dial 2-1-1 for a live specialist who can find the closest food pantry open today.' },
    { keys: ['health','clinic','doctor','hospital','medical','care','insurance','uninsured','dental','vision','prescription','pharmacy','sick','illness'], answer: '🏥 Health resources near Apex:\n\n• WakeMed Cary Hospital — 1900 Kildaire Farm Rd, Cary · (919) 350-8000 (ER open 24/7)\n• UNC Health Apex — (984) 974-1000\n• StepUp Ministry Free Clinic (uninsured adults) — 1700 Buck Jones Rd, Cary · (919) 467-8704 · stepupministry.org\n• Wake County Health & Human Services — (919) 250-3430\n\nNo insurance? StepUp Ministry offers free primary care, dental, and vision for qualifying adults.' },
    { keys: ['mental health','counseling','therapy','depression','anxiety','substance','addiction','behavioral','psychiatric','suicide','self harm','crisis line'], answer: '🧠 Mental health & behavioral health resources:\n\n• Alliance Health (crisis line, 24/7): (800) 510-9132\n• 988 Suicide & Crisis Lifeline: Call or text 988\n• Wake County Behavioral Health: (919) 250-3430\n• alliancehealthplan.org — find local counselors and programs\n\nIf you or someone you know is in immediate danger, please call 911.' },
    { keys: ['transit','bus','ride','transport','car','commute','gotriangle','goraleigh','goapex','shuttle','disability','ada','senior ride','lift'], answer: '🚌 Getting around Apex & Wake County:\n\n• GoApex (Town of Apex transit) — apexnc.org/201/GoApex-and-Regional-Transit · (919) 249-3400\n• GoTriangle (regional bus) — gotriangle.org · (919) 485-7433\n• Wake County Community Transportation (seniors & ADA) — (919) 856-6160\n• GoRaleigh — goraleigh.org\n\nNeed a ride to a medical appointment? Wake County Community Transportation provides door-to-door service for qualifying residents.' },
    { keys: ['library','book','computer','internet','wifi','homework','tutoring','ebook','digital','study','reading'], answer: '📚 Wake County Public Libraries:\n\n• Apex Branch — 1340 W Beaver Creek Dr, Apex · (919) 250-1200\n• Free services: books, eBooks, audiobooks, online databases, free Wi-Fi, and homework help\n• Adult learning, job search tools, and digital literacy classes also available\n• Hours & all branches: wakegov.com/libraries\n\nLibrary cards are free for Wake County residents!' },
    { keys: ['youth','teen','teenager','kids','after school','summer camp','program','children','child','young','4h','club'], answer: '🌱 Youth programs in Apex & Wake County:\n\n• Apex Parks & Recreation — youth sports, camps, after-school · apexnc.org · (919) 249-3400\n• YMCA of the Triangle (Cary) — 101 YMCA Dr · (919) 380-1155 · ymcatriangle.org\n• Wake County Head Start / Early Head Start (ages 0–5) — wakesmartstart.org · (919) 212-7900\n• Wake County Public Schools after-school programs — wcpss.net · (919) 431-7400\n• NC State Extension 4-H — wake.ces.ncsu.edu · (919) 250-1100' },
    { keys: ['senior','elderly','older adult','aging','55','retirement','assisted','meals on wheels','senior center'], answer: '👴 Senior resources in Apex:\n\n• Apex Senior Center (55+) — 53 Hunter St, Apex · (919) 249-3402 · apexnc.org/515/Apex-Senior-Center\n  Offers fitness classes, nutrition programs, social activities, and day trips\n• Wake County Senior Services — (919) 212-7005 · wake.gov\n• Meals on Wheels of Wake County — (919) 872-7166\n• Wake County Community Transportation (medical rides) — (919) 856-6160' },
    { keys: ['legal','lawyer','attorney','court','eviction','landlord','tenant','immigration','rights','discrimination','aid'], answer: '⚖️ Free & low-cost legal help:\n\n• Legal Aid of NC (Wake County) — 224 S Dawson St, Raleigh · (919) 856-2564 · legalaidnc.org\n  Helps with eviction, family law, public benefits, and more — free for qualifying residents\n• NC State Bar Lawyer Referral — (919) 677-8574\n• Dial 2-1-1 to be connected with additional legal resources in your area.' },
    { keys: ['housing','shelter','homeless','eviction','rent','afford','assistance','mortgage','utility','electric','water bill'], answer: '🏠 Housing & utility assistance:\n\n• Wake County Housing & Community Revitalization — (919) 856-5689 · wake.gov\n• Interact of Wake County (domestic violence shelter, confidential) — (919) 828-7740\n• Community Alternatives for Supportive Abodes (CASA) — casa-nc.org\n• Dial 2-1-1 — live specialists available 24/7 to connect you with emergency rental and utility assistance programs.' },
    { keys: ['school','education','enroll','register','wcpss','wake county schools','tuition','ged','esl','english','college','community college','wake tech','adult education'], answer: '🎓 Education resources:\n\n• Wake County Public Schools (WCPSS) — wcpss.net · (919) 431-7400\n• Wake Technical Community College — waketech.edu · (919) 866-5000\n  Offers GED/HiSET prep, ESL classes, associate degrees, workforce training\n• NC State Extension (Wake County) — wake.ces.ncsu.edu · (919) 250-1100\n  Free programs on financial literacy, nutrition, and more' },
    { keys: ['domestic violence','abuse','dv','assault','safe','unsafe','violent','partner','relationship'], answer: '🛡️ If you or someone you know is experiencing domestic violence:\n\n• Interact of Wake County Crisis Hotline (24/7, free, confidential): (919) 828-7740\n• National DV Hotline: 1-800-799-7233 or text START to 88788\n• If you are in immediate danger, call 911.\n\nInteract provides emergency shelter, legal advocacy, and transitional housing at no cost.' },
    { keys: ['211','2-1-1','helpline','hotline','social service','where do i','how do i find','i need help','not sure','don\'t know'], answer: '📞 Not sure where to start? Dial 2-1-1.\n\nNC 211 is a free, confidential helpline available 24/7. A live specialist will listen to your situation and connect you with the right local services — food, housing, health care, transportation, and more.\n\nYou can also visit nc211.org or browse the full directory on this site at directory.html.' },
    { keys: ['apex','town','government','permit','parks','recreation','town hall'], answer: '🏛️ Town of Apex resources:\n\n• Town of Apex main site: apexnc.org · (919) 249-3400\n• Apex Parks & Recreation: apexnc.org · (919) 249-3402\n• Apex Senior Center: apexnc.org/515/Apex-Senior-Center\n• Apex Police (non-emergency): (919) 362-8661\n• Apex Fire (non-emergency): (919) 362-8553\n\nFor Wake County government services, visit wake.gov.' },
    { keys: ['hello','hi','hey','good morning','good afternoon','what can you do','help','start','begin','who are you'], answer: 'Hi there! 👋 I\'m the Apex Community Hub assistant.\n\nI can help you find local resources in Apex and Wake County — just ask me about:\n🥫 Food assistance\n🏥 Health clinics\n🚌 Transit & transportation\n🌱 Youth programs\n👴 Senior services\n⚖️ Legal aid\n🏠 Housing help\n🧠 Mental health\n📚 Libraries & education\n\nWhat do you need help finding today?' },
    { keys: ['thank','thanks','appreciate','helpful','great','awesome','perfect'], answer: 'You\'re welcome! 😊 I\'m glad I could help. If you ever need to find a resource again, I\'m right here.\n\nYou can also browse the full directory at directory.html or dial 2-1-1 for live assistance anytime.' }
  ];

  function getResponse(raw) {
    const q = raw.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ');
    const words = q.split(/\s+/);
    let bestEntry = null, bestScore = 0;
    KB.forEach(entry => {
      let score = 0;
      entry.keys.forEach(kw => {
        if (q.includes(kw)) score += kw.split(' ').length * 2;
        else words.forEach(w => { if (kw === w) score += 1; });
      });
      if (score > bestScore) { bestScore = score; bestEntry = entry; }
    });
    if (bestScore > 0) return bestEntry.answer;
    return 'I want to make sure I point you in the right direction! Here are a few options:\n\n• Browse all resources: directory.html\n• Call NC 211 (free, 24/7) — dial 2-1-1 — for a live specialist\n• Apex non-emergency: (919) 362-8661\n\nYou can also try rephrasing your question — for example: "food help", "health clinic", "legal aid", "senior programs", or "transit".';
  }

  document.body.insertAdjacentHTML('beforeend', `
    <div id="chatWidget" style="position:fixed;bottom:24px;right:24px;z-index:9999;font-family:var(--font-body,system-ui,sans-serif);">
      <button id="chatToggle" aria-label="Open community assistant" title="Ask the Community Assistant"
        style="width:60px;height:60px;border-radius:50%;background:var(--teal,#1b7f79);border:none;cursor:pointer;
               box-shadow:0 4px 20px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;
               font-size:1.6rem;color:#fff;line-height:1;transition:transform .2s;">💬</button>
      <div id="chatWindow" role="dialog" aria-modal="true" aria-label="Community Assistant"
        style="display:none;flex-direction:column;position:absolute;bottom:72px;right:0;
               width:340px;max-height:530px;background:#fff;border-radius:16px;
               box-shadow:0 8px 40px rgba(26,46,74,.22);overflow:hidden;">
        <div style="background:var(--navy,#1a2e4a);padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:.65rem;">
            <div style="width:36px;height:36px;background:var(--teal,#1b7f79);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;" aria-hidden="true">🏛</div>
            <div>
              <div style="color:#fff;font-weight:700;font-size:.92rem;line-height:1.15;">Community Assistant</div>
              <div style="color:rgba(255,255,255,.5);font-size:.7rem;">Apex &amp; Wake County, NC</div>
            </div>
          </div>
          <button id="chatClose" aria-label="Close chat" style="background:none;border:none;color:rgba(255,255,255,.55);cursor:pointer;font-size:1.25rem;padding:.2rem;line-height:1;">✕</button>
        </div>
        <div id="chatMessages" role="log" aria-live="polite" aria-label="Chat messages"
          style="flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.75rem;min-height:180px;max-height:300px;">
          <div style="background:#f0f7ff;color:#1a2e4a;border-radius:12px 12px 12px 3px;padding:.75rem 1rem;font-size:.87rem;max-width:92%;line-height:1.55;white-space:pre-wrap;">Hi! 👋 I'm the Apex Community Hub assistant. Ask me about local food, health, transit, housing, legal aid, youth programs, and more.</div>
        </div>
        <div id="chatChips" role="group" aria-label="Quick questions" style="padding:.5rem 1rem .4rem;display:flex;flex-wrap:wrap;gap:.4rem;border-top:1px solid #f0f0f0;flex-shrink:0;">
          <button class="chip" data-q="Where can I find food assistance near Apex?" style="font-size:.73rem;padding:.28rem .65rem;border-radius:20px;border:1px solid #c5e4e1;background:#f0fafa;color:#1a2e4a;cursor:pointer;">🥫 Food</button>
          <button class="chip" data-q="What health clinics are near Apex?" style="font-size:.73rem;padding:.28rem .65rem;border-radius:20px;border:1px solid #c5e4e1;background:#f0fafa;color:#1a2e4a;cursor:pointer;">🏥 Health</button>
          <button class="chip" data-q="How do I get around Wake County without a car?" style="font-size:.73rem;padding:.28rem .65rem;border-radius:20px;border:1px solid #c5e4e1;background:#f0fafa;color:#1a2e4a;cursor:pointer;">🚌 Transit</button>
          <button class="chip" data-q="What youth programs are in Apex?" style="font-size:.73rem;padding:.28rem .65rem;border-radius:20px;border:1px solid #c5e4e1;background:#f0fafa;color:#1a2e4a;cursor:pointer;">🌱 Youth</button>
          <button class="chip" data-q="Senior services in Apex" style="font-size:.73rem;padding:.28rem .65rem;border-radius:20px;border:1px solid #c5e4e1;background:#f0fafa;color:#1a2e4a;cursor:pointer;">👴 Seniors</button>
          <button class="chip" data-q="I need legal help" style="font-size:.73rem;padding:.28rem .65rem;border-radius:20px;border:1px solid #c5e4e1;background:#f0fafa;color:#1a2e4a;cursor:pointer;">⚖️ Legal</button>
          <button class="chip" data-q="I need emergency help right now" style="font-size:.73rem;padding:.28rem .65rem;border-radius:20px;border:1px solid #ffc5c5;background:#fff5f5;color:#b91c1c;cursor:pointer;">🚨 Emergency</button>
        </div>
        <div style="padding:.65rem 1rem;border-top:1px solid #f0f0f0;display:flex;gap:.5rem;align-items:flex-end;flex-shrink:0;">
          <label for="chatInput" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);">Ask the community assistant</label>
          <textarea id="chatInput" rows="1" placeholder="Ask about local resources…"
            style="flex:1;border:1px solid #d0d8e4;border-radius:8px;padding:.5rem .75rem;font-size:.87rem;
                   font-family:inherit;resize:none;outline:none;line-height:1.4;max-height:80px;
                   overflow-y:auto;color:#1a2e4a;background:#fafbfc;"></textarea>
          <button id="chatSend" aria-label="Send message"
            style="width:36px;height:36px;background:var(--teal,#1b7f79);border:none;border-radius:50%;
                   cursor:pointer;display:flex;align-items:center;justify-content:center;
                   flex-shrink:0;font-size:1rem;color:#fff;">➤</button>
        </div>
      </div>
    </div>`);

  const toggle   = document.getElementById('chatToggle');
  const closeBtn = document.getElementById('chatClose');
  const win      = document.getElementById('chatWindow');
  const input    = document.getElementById('chatInput');
  const sendBtn  = document.getElementById('chatSend');
  const msgBox   = document.getElementById('chatMessages');
  const chips    = document.getElementById('chatChips');

  function openChat()  { win.style.display = 'flex'; win.style.flexDirection = 'column'; toggle.setAttribute('aria-label','Close community assistant'); toggle.textContent = '✕'; input.focus(); }
  function closeChat() { win.style.display = 'none'; toggle.setAttribute('aria-label','Open community assistant'); toggle.textContent = '💬'; }
  toggle.addEventListener('click', () => win.style.display === 'none' ? openChat() : closeChat());
  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && win.style.display !== 'none') closeChat(); });

  function bubble(text, role) {
    const d = document.createElement('div');
    const bot = role === 'bot';
    d.style.cssText = `background:${bot?'#f0f7ff':'var(--teal,#1b7f79)'};color:${bot?'#1a2e4a':'#fff'};border-radius:${bot?'12px 12px 12px 3px':'12px 12px 3px 12px'};padding:.75rem 1rem;font-size:.87rem;max-width:92%;align-self:${bot?'flex-start':'flex-end'};line-height:1.55;white-space:pre-wrap;word-break:break-word;`;
    d.textContent = text;
    msgBox.appendChild(d);
    msgBox.scrollTop = msgBox.scrollHeight;
    return d;
  }
  function typingDots() {
    const d = document.createElement('div');
    d.id = 'typingDots';
    d.setAttribute('aria-label', 'Assistant is typing');
    d.style.cssText = 'background:#f0f7ff;border-radius:12px 12px 12px 3px;padding:.6rem 1rem;font-size:1rem;color:#999;align-self:flex-start;letter-spacing:.15em;';
    d.textContent = '● ● ●';
    msgBox.appendChild(d);
    msgBox.scrollTop = msgBox.scrollHeight;
  }
  function removeTyping() { const el = document.getElementById('typingDots'); if (el) el.remove(); }

  function send(text) {
    text = text.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    if (chips) chips.style.display = 'none';
    bubble(text, 'user');
    typingDots();
    sendBtn.disabled = true;
    setTimeout(() => {
      removeTyping();
      bubble(getResponse(text), 'bot');
      sendBtn.disabled = false;
    }, 420 + Math.random() * 300);
  }

  sendBtn.addEventListener('click', () => send(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
  input.addEventListener('input', function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 80) + 'px'; });
  document.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => send(btn.dataset.q)));
})();
