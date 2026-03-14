// Cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0;
let my = 0;
let rx = 0;
let ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
});

(function animateRing() {
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

// Navigation and scrolling
const nav = document.getElementById('nav');
const progressBar = document.getElementById('scroll-progress');
const backTop = document.getElementById('back-top');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 60);
  backTop.classList.toggle('visible', scrollY > 400);

  const scrolled = scrollY / (document.body.scrollHeight - innerHeight);
  progressBar.style.width = `${scrolled * 100}%`;
}, { passive: true });

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
    if (value) el.innerHTML = value;
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
window.toggleTheme = function() {
  baseToggleTheme();
  playThemeSound();
};

// Cursor trail
const TRAIL_COUNT = 12;
const trails = [];
let trailMx = 0;
let trailMy = 0;

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

typeLoop();

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
  li.innerHTML = '<a href="#timeline" data-ru="Путь" data-en="Journey" onclick="closeBurger()">Путь</a>';
  navLinks.insertBefore(li, navLinks.children[1]);
}

// Mobile menu
function toggleBurger() {
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');

  burger.classList.toggle('open');
  links.classList.toggle('open');
  document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
}

function closeBurger() {
  document.getElementById('burger').classList.remove('open');
  document.getElementById('navLinks').classList.remove('open');
  document.body.style.overflow = '';
}

// Particles
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
const particles = [];

function resizeCanvas() {
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

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

for (let i = 0; i < 120; i++) particles.push(createParticle());
animateParticles();

// Stats counter
const statsGrid = document.getElementById('statsGrid');
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
console.log('%cЭтот сайт написал Amir Tursunov с нуля — HTML, CSS, JS.', 'color:#a855f7;font-size:13px;');
console.log('%c📧 Хочешь поработать вместе? tursunov.amir701@gmail.com', 'color:#e2e2ee;font-size:13px;');
console.log('%c🔐 P.S. Если найдёшь уязвимость — напиши мне 😄', 'color:#5a5a72;font-size:12px;');
