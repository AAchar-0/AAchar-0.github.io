// 'use strict' makes JavaScript stricter, so silly mistakes throw errors early.
'use strict';

// ---------- 1. Mobile menu ----------
// querySelector finds the first element matching a CSS selector.
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('#nav');

// One small function that closes the menu, so every part below can reuse it.
function closeMenu() {
  nav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}

// addEventListener runs a function whenever the event (here 'click') happens.
menuBtn.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');     // add/remove the 'open' class
  menuBtn.setAttribute('aria-expanded', isOpen);   // tell screen readers the state
});

// Close the menu after a link is tapped (forEach loops over each link).
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

// Close the menu when the visitor taps anywhere outside it.
// event.target is the exact element that was clicked;
// contains() checks whether that element is inside the menu or the Menu button.
document.addEventListener('click', (event) => {
  const clickedInsideMenu = nav.contains(event.target) || menuBtn.contains(event.target);
  if (!clickedInsideMenu) closeMenu();
});

// Close the menu with the Escape key too (helps keyboard users).
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

// ---------- 1b. Theme button ----------
// matchMedia asks the browser whether the visitor's device prefers dark mode.
const themeBtn = document.querySelector('.theme-btn');
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

// A saved choice (data-theme) wins; otherwise follow the device setting.
function currentTheme() {
  return document.documentElement.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
}

// Moon means "tap for dark"; sun means "tap for light".
function showTheme() {
  const dark = currentTheme() === 'dark';
  themeBtn.firstElementChild.textContent = dark ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
}

themeBtn.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  // localStorage remembers the choice; try/catch covers browsers that block it.
  try { localStorage.setItem('theme', next); } catch (error) { /* ignore */ }
  showTheme();
});
darkQuery.addEventListener('change', showTheme); // device setting changed
showTheme();

// ---------- 2. Footer year (updates itself every January) ----------
document.querySelector('#year').textContent = new Date().getFullYear();

// ---------- 3. Contact form ----------
const form = document.querySelector('#contact-form');
const statusText = document.querySelector('#form-status');

// 'async' lets us use 'await' to pause until the network request finishes.
form.addEventListener('submit', async (event) => {
  event.preventDefault();               // stop the browser's default page reload
  statusText.textContent = 'Sending…';

  try {
    // fetch sends the form data to Formspree in the background.
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),         // collects every named field for us
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      statusText.textContent = 'Message sent. I’ll reply within two working days.';
      form.reset();                     // clear the fields
    } else {
      statusText.textContent = 'The message was not sent. Check your details and try again.';
    }
  } catch (error) {
    // catch runs if the network itself fails (for example, no internet).
    statusText.textContent = 'No connection. Check your internet and try again.';
  }
});

// ---------- 4. Scroll progress bar ----------
// The bar under the header grows from 0 to full width as the page is scrolled.
const progressBar = document.querySelector('.scroll-progress');

function updateScrollProgress() {
  // How far the page can scroll = total page height minus the visible window height.
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  // 0 at the very top, 1 at the very bottom. The check avoids dividing by 0 on a short page.
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  // Clamp to 0..1: phones can briefly scroll past the ends (elastic bounce).
  const clamped = Math.min(1, Math.max(0, progress));
  // scaleX stretches the bar horizontally; the GPU does it, so it stays smooth.
  progressBar.style.transform = `scaleX(${clamped})`;
}

// Scroll events can fire many times per frame. requestAnimationFrame runs the update
// at most once per screen refresh, which keeps the motion smooth and cheap.
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      updateScrollProgress();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });   // passive: tells the browser this listener never blocks scrolling

window.addEventListener('resize', updateScrollProgress);   // page height changes when the window resizes
updateScrollProgress();                                     // set the right width on page load