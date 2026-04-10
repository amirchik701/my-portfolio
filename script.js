const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(pointer: fine)').matches && window.matchMedia('(hover: hover)').matches;
const shouldRunHeavyAnimations = !prefersReducedMotion;
const shouldShowCustomCursor = hasFinePointer && !prefersReducedMotion;

function sanitizeMarkup(raw) {
  const template = document.createElement('template');
  template.innerHTML = raw;
  const allowedTags = new Set(['STRONG', 'BR', 'SPAN']);

  template.content.querySelectorAll('*').forEach(node => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(document.createTextNode(node.textContent || ''));
      return;
    }

    [...node.attributes].forEach(attr => {
      if (attr.name !== 'class') node.removeAttribute(attr.name);
    });
  });

  return template.innerHTML;
}

// Cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0;
let my = 0;
let rx = 0;
let ry = 0;

if (shouldShowCustomCursor && cursor && ring) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
  });

  (function animateRing() {
    if (document.hidden) {
      requestAnimationFrame(animateRing);
      return;
    }

    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button, .proj-card, .skill-cell, .about-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '56px';
      ring.style.height = '56px';
      ring.style.opacity = '0.25';
    });

    el.addEventListener('mouseleave', () => {
      ring.style.width = '36px';
      ring.style.height = '36px';
      ring.style.opacity = '0.5';
    });
  });
}

// Navigation and scrolling
const nav = document.getElementById('nav');
const progressBar = document.getElementById('scroll-progress');
const backTop = document.getElementById('back-top');

let scrollTicking = false;
function updateScrollUI() {
  nav.classList.toggle('scrolled', scrollY > 60);
  backTop.classList.toggle('visible', scrollY > 400);

  const maxScroll = Math.max(document.body.scrollHeight - innerHeight, 1);
  const scrolled = Math.min(scrollY / maxScroll, 1);
  progressBar.style.width = `${scrolled * 100}%`;
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScrollUI);
}, { passive: true });

backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
updateScrollUI();

// Section reveal
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('on');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Skills animation
const skillsGrid = document.getElementById('skillsGrid');
const skillsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.querySelectorAll('.skill-cell').forEach((cell, index) => {
      setTimeout(() => {
        cell.querySelector('.skill-fill').style.width = `${cell.dataset.level}%`;
      }, index * 120);
    });

    skillsObserver.unobserve(entry.target);
  });
}, { threshold: 0.2 });

if (skillsGrid) skillsObserver.observe(skillsGrid);

// Language switcher
let currentLang = 'ru';

function setLang(lang) {
  currentLang = lang;
  document.getElementById('btnRu').classList.toggle('active', lang === 'ru');
  document.getElementById('btnEn').classList.toggle('active', lang === 'en');

  document.querySelectorAll('[data-ru][data-en]').forEach(el => {
    const value = el.getAttribute(`data-${lang}`);
    if (value) el.innerHTML = sanitizeMarkup(value);
  });

  document.querySelectorAll('[data-ru-ph][data-en-ph]').forEach(el => {
    const value = el.getAttribute(`data-${lang}-ph`);
    if (value) el.placeholder = value;
  });

  document.title = lang === 'en'
    ? 'Tursunov Amir — Frontend Developer'
    : 'Турсунов Амир — Frontend Developer';
  document.documentElement.lang = lang;
}

// Theme switcher
let isDark = true;

function toggleTheme() {
  isDark = !isDark;
  document.documentElement.classList.toggle('light', !isDark);
  document.getElementById('themeThumb').textContent = isDark ? '🌙' : '☀️';
}

function playThemeSound() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.frequency.setValueAtTime(isDark ? 660 : 440, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isDark ? 880 : 330, ac.currentTime + 0.12);
    gain.gain.setValueAtTime(0.06, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);

    osc.start();
    osc.stop(ac.currentTime + 0.18);
  } catch (e) {}
}

const baseToggleTheme = toggleTheme;
function handleThemeToggle() {
  baseToggleTheme();
  playThemeSound();
}

const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) themeToggleBtn.addEventListener('click', handleThemeToggle);

// Cursor trail
const TRAIL_COUNT = 12;
const trails = [];
let trailMx = 0;
let trailMy = 0;

if (shouldShowCustomCursor) {
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'trail-dot';
    document.body.appendChild(dot);
    trails.push({ el: dot, x: 0, y: 0 });
  }

  document.addEventListener('mousemove', e => {
    trailMx = e.clientX;
    trailMy = e.clientY;
  });

  (function animateTrail() {
    if (document.hidden) {
      requestAnimationFrame(animateTrail);
      return;
    }

    let px = trailMx;
    let py = trailMy;

    trails.forEach((trail, index) => {
      const delay = 1 - index / TRAIL_COUNT;
      trail.x += (px - trail.x) * (0.35 - index * 0.018);
      trail.y += (py - trail.y) * (0.35 - index * 0.018);
      trail.el.style.transform = `translate(${trail.x}px, ${trail.y}px) translate(-50%,-50%)`;
      trail.el.style.opacity = (delay * 0.45).toFixed(2);
      trail.el.style.width = `${5 - index * 0.3}px`;
      trail.el.style.height = `${5 - index * 0.3}px`;
      px = trail.x;
      py = trail.y;
    });

    requestAnimationFrame(animateTrail);
  })();
}

// Typing effect
const typingEl = document.getElementById('typing-text');
const typingPhrases = [
  'Frontend Developer.',
  'InfoSec Student.',
  'Fast Learner.',
  'Open to Projects.',
];

let tPhrase = 0;
let tChar = 0;
let tDeleting = false;

function typeLoop() {
  const current = typingPhrases[tPhrase];

  if (!tDeleting) {
    tChar++;
    typingEl.textContent = current.slice(0, tChar);

    if (tChar === current.length) {
      tDeleting = true;
      setTimeout(typeLoop, 1800);
      return;
    }

    setTimeout(typeLoop, 80);
    return;
  }

  tChar--;
  typingEl.textContent = current.slice(0, tChar);

  if (tChar === 0) {
    tDeleting = false;
    tPhrase = (tPhrase + 1) % typingPhrases.length;
    setTimeout(typeLoop, 300);
    return;
  }

  setTimeout(typeLoop, 45);
}

if (typingEl && !prefersReducedMotion) {
  typeLoop();
} else if (typingEl) {
  typingEl.textContent = typingPhrases[0];
}

// Timeline
const timelineObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('on'), 100);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.tl-item').forEach((el, index) => {
  el.style.transitionDelay = `${index * 0.12}s`;
  timelineObserver.observe(el);
});

const navLinks = document.getElementById('navLinks');
if (navLinks) {
  const li = document.createElement('li');
  li.innerHTML = '<a href="#timeline" data-ru="Путь" data-en="Journey">Путь</a>';
  navLinks.insertBefore(li, navLinks.children[1]);
}

// Mobile menu
function toggleBurger() {
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');
  if (!burger || !links) return;

  burger.classList.toggle('open');
  links.classList.toggle('open');
  burger.setAttribute('aria-expanded', links.classList.contains('open') ? 'true' : 'false');
  document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
}

function closeBurger() {
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');
  if (!burger || !links) return;
  burger.classList.remove('open');
  links.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

const burger = document.getElementById('burger');
if (burger) burger.addEventListener('click', toggleBurger);

if (navLinks) {
  navLinks.addEventListener('click', e => {
    if (e.target instanceof Element && e.target.closest('a')) closeBurger();
  });
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeBurger();
}, { passive: true });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeBurger();
});

const btnRu = document.getElementById('btnRu');
const btnEn = document.getElementById('btnEn');
if (btnRu) btnRu.addEventListener('click', () => setLang('ru'));
if (btnEn) btnEn.addEventListener('click', () => setLang('en'));

// Particles
const canvas = document.getElementById('particles-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const particles = [];

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function createParticle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    opacity: Math.random() * 0.6 + 0.1,
    speed: Math.random() * 0.3 + 0.05,
    drift: (Math.random() - 0.5) * 0.15,
  };
}

function animateParticles() {
  if (!canvas || !ctx) return;
  if (document.hidden) {
    requestAnimationFrame(animateParticles);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const accent = document.documentElement.classList.contains('light')
    ? '0,153,102'
    : '0,204,136';

  particles.forEach(particle => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${accent},${particle.opacity})`;
    ctx.fill();

    particle.y -= particle.speed;
    particle.x += particle.drift;

    if (particle.y < -5) {
      particle.y = canvas.height + 5;
      particle.x = Math.random() * canvas.width;
    }

    if (particle.x < 0 || particle.x > canvas.width) particle.drift *= -1;
  });

  requestAnimationFrame(animateParticles);
}

if (canvas && ctx && shouldRunHeavyAnimations) {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });
  const particleCount = hasFinePointer ? 120 : 45;
  for (let i = 0; i < particleCount; i++) particles.push(createParticle());
  animateParticles();
}

// Stats counter
const statsGrid = document.getElementById('statsGrid');
const projectsGrid = document.querySelector('.projects-grid');
const projectCards = projectsGrid ? [...projectsGrid.querySelectorAll('.proj-card')] : [];
const filterButtons = [...document.querySelectorAll('.filter-btn')];

if (projectCards.length) {
  const projectsCount = projectCards.length;
  const projectsStatEl = statsGrid ? statsGrid.querySelector('.stat-num') : null;
  if (projectsStatEl) projectsStatEl.dataset.target = String(projectsCount);
}

function matchesFilter(card, filterKey) {
  if (filterKey === 'all') return true;
  const kinds = (card.dataset.projectKind || '').split(' ').filter(Boolean);
  return kinds.includes(filterKey);
}

function applyProjectFilter(filterKey) {
  projectCards.forEach(card => {
    const visible = matchesFilter(card, filterKey);
    card.style.display = visible ? '' : 'none';
  });
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const filterKey = btn.dataset.projectFilter || 'all';
    filterButtons.forEach(item => item.classList.remove('active'));
    btn.classList.add('active');
    applyProjectFilter(filterKey);
  });
});

function appendUtmParams(urlValue, trackId) {
  try {
    const url = new URL(urlValue);
    if (!/^https?:$/i.test(url.protocol)) return urlValue;
    url.searchParams.set('utm_source', 'portfolio');
    url.searchParams.set('utm_medium', 'cta');
    url.searchParams.set('utm_campaign', trackId || 'click');
    return url.toString();
  } catch (err) {
    return urlValue;
  }
}

function trackClick(trackId, href) {
  const payload = {
    event: 'portfolio_click',
    trackId,
    href,
    ts: Date.now(),
  };

  if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'portfolio_click', {
      event_category: 'engagement',
      event_label: trackId,
      link_url: href,
    });
  }
}

document.querySelectorAll('.js-track-link').forEach(link => {
  const trackId = link.dataset.trackId || 'unknown_click';
  const originalHref = link.getAttribute('href');
  if (!originalHref) return;

  const hrefWithUtm = appendUtmParams(originalHref, trackId);
  if (hrefWithUtm !== originalHref) link.setAttribute('href', hrefWithUtm);

  link.addEventListener('click', () => {
    trackClick(trackId, link.getAttribute('href') || originalHref);
  });
});

function applyPreviewFallback(imgEl) {
  const placeholder = './assets/project-placeholder.svg';
  imgEl.src = placeholder;
  imgEl.classList.add('is-fallback');
}

document.querySelectorAll('.proj-shot').forEach(imgEl => {
  imgEl.addEventListener('error', () => applyPreviewFallback(imgEl), { once: true });
});

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.querySelectorAll('.stat-num').forEach(el => {
      const target = Number(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = target / 50;

      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.round(current) + suffix;
        if (current >= target) clearInterval(timer);
      }, 28);
    });

    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });

if (statsGrid) statsObserver.observe(statsGrid);

// Console easter egg
console.log('%c👋 Привет! Я рад что ты заглянул в консоль.', 'color:#00cc88;font-size:16px;font-weight:bold;');
console.log('%cСайт написан с нуля без тяжелых фреймворков.', 'color:#a855f7;font-size:13px;');
console.log('%c🔐 P.S. Попробуй нажать Ctrl + ~ прямо на сайте...', 'color:#ff5f56;font-size:14px;font-weight:bold;');

// --- Contact Form ---
const contactForm = document.getElementById('contactForm');
const contactSubmit = document.getElementById('contactSubmit');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const originalText = contactSubmit.textContent;
    contactSubmit.textContent = currentLang === 'en' ? 'Sending...' : 'Отправка...';
    contactSubmit.disabled = true;
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    try {
      // Имитация задержки сети, так как реального бекенда пока нет
      await new Promise(r => setTimeout(r, 1200));

      formStatus.textContent = currentLang === 'en' ? 'Message sent successfully! (Simulated)' : 'Сообщение успешно отправлено! (Демонстрация)';
      formStatus.classList.add('success');
      contactForm.reset();
    } catch (err) {
      formStatus.textContent = currentLang === 'en' ? 'Oops! There was a problem.' : 'Произошла ошибка при отправке.';
      formStatus.classList.add('error');
    } finally {
      contactSubmit.textContent = originalText;
      contactSubmit.disabled = false;
    }
  });
}

// --- Terminal Logic ---
const terminalOverlay = document.getElementById('terminal');
const terminalClose = document.getElementById('terminalClose');
const termInput = document.getElementById('termInput');
const termBody = document.getElementById('termBody');

const commands = {
  help: () => 'Available commands: <span class="term-hl">help, whoami, skills, clear</span>. Or try finding the <span class="term-hl-purple">flag</span>.',
  whoami: () => 'guest@amirtursunov. I am Amir Tursunov, a Frontend Developer & InfoSec student.',
  skills: () => 'HTML, CSS, JS, Python, Penetration Testing, Git. Constantly learning.',
  clear: () => { termBody.innerHTML = ''; return ''; },
  'cat flag.txt': () => '<span class="term-hl-purple">CTF{y0u_f0und_th3_p0rtf0l1o_fl4g}</span><br>Well played! Send me this flag if you want to connect!',
  'sudo': () => 'guest is not in the sudoers file. This incident will be reported.',
};

function printTerm(text, isInput = false) {
  if (!text) return;
  const line = document.createElement('div');
  line.className = 'term-line';
  if (isInput) {
    line.innerHTML = `<span class="term-prompt">guest@amirtursunov:~$</span> ${text.replace(/</g, "&lt;")}`;
  } else {
    line.innerHTML = text;
  }
  termBody.appendChild(line);
  termBody.scrollTop = termBody.scrollHeight;
}

function parseCommand(cmd) {
  const c = cmd.trim().toLowerCase();
  if (!c) return;
  printTerm(cmd, true);
  
  if (commands[c]) {
    printTerm(commands[c]());
  } else if (c.startsWith('cat ')) {
    printTerm(`cat: ${c.substring(4)}: Permission denied`);
  } else {
    printTerm(`Command not found: ${c}. Type <span class="term-hl">help</span>.`);
  }
}

function toggleTerminal() {
  if (!terminalOverlay) return;
  const isOpen = terminalOverlay.classList.contains('open');
  if (isOpen) {
    terminalOverlay.classList.remove('open');
    terminalOverlay.setAttribute('aria-hidden', 'true');
    termInput.blur();
  } else {
    terminalOverlay.classList.add('open');
    terminalOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => termInput.focus(), 100);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && (e.key === '\`' || e.key === '~' || e.code === 'Backquote')) {
    e.preventDefault();
    toggleTerminal();
  }
});

if (terminalClose) terminalClose.addEventListener('click', toggleTerminal);
if (termInput) {
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      parseCommand(termInput.value);
      termInput.value = '';
    }
  });
}
