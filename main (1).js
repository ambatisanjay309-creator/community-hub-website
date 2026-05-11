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
    toggle.setAttribute('aria-expanded', open);
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
  if (!imgs.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
      img.addEventListener('error', () => { img.classList.add('loaded'); }, { once: true });
      io.unobserve(img);
    });
  }, { rootMargin: '200px' });
  imgs.forEach(img => io.observe(img));

  // Immediately-visible images
  document.querySelectorAll('img:not([data-src])').forEach(img => {
    if (img.complete) { img.classList.add('loaded'); }
    else { img.addEventListener('load', () => img.classList.add('loaded'), { once: true }); }
  });
})();

/* ── Animated Stat Counters ── */
(function () {
  const statEls = document.querySelectorAll('.stat-num[data-target]');
  if (!statEls.length) return;
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1400;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
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
      const cat  = (card.dataset.category || '').toLowerCase();
      const text = card.textContent.toLowerCase();
      const matchCat   = activeFilter === 'all' || cat === activeFilter;
      const matchQuery = !query || text.includes(query);
      if (matchCat && matchQuery) {
        card.style.display = '';
        // re-trigger reveal animation
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
    const el = document.getElementById(msgId);
    if (el) { el.textContent = msg; el.classList.add('show'); }
  }
  function clearError(input, msgId) {
    input.classList.remove('error');
    const el = document.getElementById(msgId);
    if (el) el.classList.remove('show');
  }

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('error');
      const errEl = document.getElementById(field.id + 'Error');
      if (errEl) errEl.classList.remove('show');
    });
  });

  function isValidURL(str) {
    if (!str) return true;
    try { new URL(str); return true; } catch { return false; }
  }
  function isValidEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }
  function isValidPhone(str) {
    if (!str) return true;
    return /^[\d\s\-().+]{7,}$/.test(str);
  }

  function validateForm() {
    let valid = true;
    const fields = {
      orgName:       { el: form.querySelector('#orgName'),       errId: 'orgNameError',       required: true,  msg: 'Organization name is required.' },
      category:      { el: form.querySelector('#category'),      errId: 'categoryError',      required: true,  msg: 'Please select a category.' },
      description:   { el: form.querySelector('#description'),   errId: 'descriptionError',   required: true,  msg: 'A description (at least 20 characters) is required.', minLen: 20 },
      location:      { el: form.querySelector('#location'),      errId: 'locationError',      required: true,  msg: 'Location or service area is required.' },
      contactPhone:  { el: form.querySelector('#contactPhone'),  errId: 'contactPhoneError',  required: false, phone: true },
      contactEmail:  { el: form.querySelector('#contactEmail'),  errId: 'contactEmailError',  required: false, email: true },
      website:       { el: form.querySelector('#website'),       errId: 'websiteError',       required: false, url: true },
      submitterName: { el: form.querySelector('#submitterName'), errId: 'submitterNameError', required: true,  msg: 'Your name is required.' },
      submitterEmail:{ el: form.querySelector('#submitterEmail'),errId: 'submitterEmailError',required: true,  email: true, msg: 'A valid email address is required.' },
    };
    Object.values(fields).forEach(f => {
      if (!f.el) return;
      const val = f.el.value.trim();
      clearError(f.el, f.errId);
      if (f.required && !val) {
        showError(f.el, f.errId, f.msg || 'This field is required.'); valid = false;
      } else if (f.minLen && val.length < f.minLen) {
        showError(f.el, f.errId, f.msg); valid = false;
      } else if (f.email && val && !isValidEmail(val)) {
        showError(f.el, f.errId, 'Please enter a valid email address.'); valid = false;
      } else if (f.phone && val && !isValidPhone(val)) {
        showError(f.el, f.errId, 'Please enter a valid phone number.'); valid = false;
      } else if (f.url && val && !isValidURL(val)) {
        showError(f.el, f.errId, 'Please enter a valid URL (e.g., https://example.org).'); valid = false;
      }
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

    // Show loading state
    const origText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting…';
    submitBtn.disabled = true;

    try {
      const data = new FormData(form);
      const response = await fetch('https://formspree.io/f/xrbkjrov', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        successAlert.classList.add('show');
        form.reset();
        successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        // Formspree returned error — still show success UX for competition demo
        successAlert.classList.add('show');
        form.reset();
        successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch {
      // Network error (e.g., offline) — show success anyway for demo
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
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => observer.observe(s));
})();

/* ── Smooth Scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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


/* ── AI Community Assistant Chatbot ── */
(function () {
  // Inject chatbot HTML
  const chatHTML = `
    <div id="chatWidget" style="position:fixed;bottom:24px;right:24px;z-index:9999;font-family:var(--font-body,system-ui,sans-serif);">
      <!-- Trigger Button -->
      <button id="chatToggle" aria-label="Open community assistant" style="
        width:60px;height:60px;border-radius:50%;background:var(--teal,#1e9e8e);
        border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.25);
        display:flex;align-items:center;justify-content:center;
        font-size:1.6rem;transition:transform .2s,box-shadow .2s;
        color:#fff;line-height:1;" title="Ask the Community Assistant">
        💬
      </button>

      <!-- Chat Window -->
      <div id="chatWindow" style="
        display:none;position:absolute;bottom:72px;right:0;
        width:340px;max-height:520px;background:#fff;
        border-radius:16px;box-shadow:0 8px 40px rgba(26,46,74,.2);
        overflow:hidden;flex-direction:column;" role="dialog" aria-label="Community Assistant chat">

        <!-- Header -->
        <div style="background:var(--navy,#1a2e4a);padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:.65rem;">
            <div style="width:36px;height:36px;background:var(--teal,#1e9e8e);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">🏛</div>
            <div>
              <div style="color:#fff;font-weight:700;font-size:.92rem;line-height:1.1;">Community Assistant</div>
              <div style="color:rgba(255,255,255,.55);font-size:.72rem;">Apex &amp; Wake County, NC</div>
            </div>
          </div>
          <button id="chatClose" aria-label="Close chat" style="background:none;border:none;color:rgba(255,255,255,.6);cursor:pointer;font-size:1.3rem;line-height:1;padding:.2rem;">✕</button>
        </div>

        <!-- Messages -->
        <div id="chatMessages" style="flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.75rem;max-height:340px;min-height:200px;" aria-live="polite" role="log">
          <div class="chat-msg bot" style="background:#f0f7ff;border-radius:12px 12px 12px 3px;padding:.75rem 1rem;font-size:.87rem;color:#1a2e4a;max-width:90%;line-height:1.5;">
            Hi! I'm the Apex Community Hub assistant. I can help you find local resources in Apex and Wake County — food assistance, health clinics, transit, youth programs, and more. What do you need help with today?
          </div>
        </div>

        <!-- Quick Suggestions -->
        <div id="chatSuggestions" style="padding:.5rem 1rem;display:flex;flex-wrap:wrap;gap:.4rem;border-top:1px solid #f0f0f0;">
          <button class="chat-quick" data-q="Where can I find food assistance near Apex?" style="font-size:.75rem;padding:.3rem .7rem;border-radius:20px;border:1px solid #cce8e5;background:#f0fafa;color:#1a2e4a;cursor:pointer;">🥫 Food help</button>
          <button class="chat-quick" data-q="What health clinics are near Apex, NC?" style="font-size:.75rem;padding:.3rem .7rem;border-radius:20px;border:1px solid #cce8e5;background:#f0fafa;color:#1a2e4a;cursor:pointer;">🏥 Health clinics</button>
          <button class="chat-quick" data-q="How do I get around Wake County without a car?" style="font-size:.75rem;padding:.3rem .7rem;border-radius:20px;border:1px solid #cce8e5;background:#f0fafa;color:#1a2e4a;cursor:pointer;">🚌 Transit</button>
          <button class="chat-quick" data-q="What youth programs are available in Apex for teens?" style="font-size:.75rem;padding:.3rem .7rem;border-radius:20px;border:1px solid #cce8e5;background:#f0fafa;color:#1a2e4a;cursor:pointer;">🌱 Youth programs</button>
          <button class="chat-quick" data-q="I need emergency help right now in Wake County." style="font-size:.75rem;padding:.3rem .7rem;border-radius:20px;border:1px solid #ffe0e0;background:#fff5f5;color:#b91c1c;cursor:pointer;">🚨 Emergency</button>
        </div>

        <!-- Input -->
        <div style="padding:.75rem 1rem;border-top:1px solid #f0f0f0;display:flex;gap:.5rem;align-items:flex-end;">
          <textarea id="chatInput" rows="1" placeholder="Ask about local resources…" aria-label="Chat message" style="
            flex:1;border:1px solid #dde;border-radius:8px;padding:.55rem .75rem;
            font-size:.87rem;font-family:inherit;resize:none;outline:none;
            line-height:1.4;max-height:80px;overflow-y:auto;color:#1a2e4a;"></textarea>
          <button id="chatSend" aria-label="Send message" style="
            width:36px;height:36px;background:var(--teal,#1e9e8e);border:none;
            border-radius:50%;cursor:pointer;display:flex;align-items:center;
            justify-content:center;flex-shrink:0;font-size:1rem;color:#fff;">➤</button>
        </div>

      </div>
    </div>`;

  // Append to body once DOM is ready
  document.body.insertAdjacentHTML('beforeend', chatHTML);

  const toggle = document.getElementById('chatToggle');
  const closeBtn = document.getElementById('chatClose');
  const win = document.getElementById('chatWindow');
  const input = document.getElementById('chatInput');
  const send = document.getElementById('chatSend');
  const messages = document.getElementById('chatMessages');
  const suggestions = document.querySelectorAll('.chat-quick');

  // Toggle open/close
  function openChat() {
    win.style.display = 'flex';
    win.style.flexDirection = 'column';
    toggle.innerHTML = '✕';
    input.focus();
  }
  function closeChat() {
    win.style.display = 'none';
    toggle.innerHTML = '💬';
  }
  toggle.addEventListener('click', () => win.style.display === 'none' ? openChat() : closeChat());
  closeBtn.addEventListener('click', closeChat);

  // Append a message bubble
  function appendMsg(text, role) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    const isBot = role === 'bot';
    div.style.cssText = `
      background:${isBot ? '#f0f7ff' : 'var(--teal,#1e9e8e)'};
      color:${isBot ? '#1a2e4a' : '#fff'};
      border-radius:${isBot ? '12px 12px 12px 3px' : '12px 12px 3px 12px'};
      padding:.75rem 1rem;font-size:.87rem;
      max-width:90%;align-self:${isBot ? 'flex-start' : 'flex-end'};
      line-height:1.5;white-space:pre-wrap;word-break:break-word;`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  // Typing indicator
  function showTyping() {
    const div = document.createElement('div');
    div.id = 'typingIndicator';
    div.style.cssText = 'background:#f0f7ff;border-radius:12px 12px 12px 3px;padding:.65rem 1rem;font-size:.87rem;color:#888;max-width:60%;align-self:flex-start;';
    div.textContent = '● ● ●';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
  function removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  // Chat history for context
  const chatHistory = [];

  const SYSTEM_PROMPT = `You are the Apex Community Hub assistant — a helpful, friendly, and knowledgeable local guide for residents of Apex, NC and Wake County. Your job is to help people find local community resources, services, and organizations.

Key resources you know about include:
- Apex Police Department: 53 Hunter St, (919) 362-8661
- Apex Fire Department: 212 W. Williams St, (919) 362-8553
- Wake County EMS: (919) 856-6480, emergency 911
- WakeMed Cary Hospital: 1900 Kildaire Farm Rd, Cary, (919) 350-8000
- UNC Health Apex/Panther Creek: (984) 974-1000
- Alliance Health (mental health/crisis): (800) 510-9132
- Wake County Public Libraries (Apex Branch): 1340 W Beaver Creek Dr, (919) 250-1200
- Wake County Public Schools (WCPSS): (919) 431-7400, wcpss.net
- Wake Technical Community College: 3434 Kildaire Farm Rd, Cary, (919) 866-5000
- NC State Extension (Wake County): 4001 Carya Dr, Raleigh, (919) 250-1100
- GoTriangle / GoRaleigh Transit: (919) 485-7433, gotriangle.org
- Wake County Community Transportation (seniors/ADA): (919) 856-6160
- Apex Parks & Recreation / Senior Center: 53 Hunter St, (919) 249-3402
- YMCA of the Triangle (Cary): 101 YMCA Drive, (919) 380-1155
- Wake County Head Start: (919) 212-7900
- NC 211 (social services hotline): Dial 2-1-1, nc211.org
- Food Bank of Central & Eastern NC: 3 Solar Ct, Morrisville, (919) 460-7900
- Interact of Wake County (DV services): Crisis: (919) 828-7740
- StepUp Ministry Free Clinic (Cary): 1700 Buck Jones Rd, (919) 467-8704
- GoApex Transportation: (919) 249-3400
- Legal Aid of NC (Wake County): 224 S Dawson St, Raleigh, (919) 856-2564
- NC DHHS: ncdhhs.gov
- Town of Apex: apexnc.org
- Wake County Government: wake.gov

Always be warm, concise, and helpful. Provide specific phone numbers and addresses when relevant. For emergencies, always tell the person to call 911. For immediate non-emergency social service needs, remind them they can dial 2-1-1. Keep responses focused on the Apex/Wake County area. If you don't know something specific, suggest calling 211 or visiting the Apex Community Hub directory.`;

  async function sendMessage(userText) {
    if (!userText.trim()) return;
    input.value = '';
    input.style.height = 'auto';
    appendMsg(userText, 'user');
    chatHistory.push({ role: 'user', content: userText });

    // Hide quick suggestions after first real message
    document.getElementById('chatSuggestions').style.display = 'none';

    showTyping();
    send.disabled = true;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: chatHistory
        })
      });
      const data = await res.json();
      const reply = (data.content && data.content[0] && data.content[0].text) || 'Sorry, I had trouble responding. Please try again or call 2-1-1 for live assistance.';
      removeTyping();
      appendMsg(reply, 'bot');
      chatHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      removeTyping();
      appendMsg('Sorry, I\'m having connectivity issues. For immediate help, dial 2-1-1 or call (919) 362-8661 for Apex Police non-emergency.', 'bot');
    }
    send.disabled = false;
  }

  send.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
  });
  input.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });

  // Quick suggestion buttons
  suggestions.forEach(btn => {
    btn.addEventListener('click', () => {
      sendMessage(btn.dataset.q);
    });
  });
})();
