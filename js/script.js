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

// Moon icon means "tap for dark"; sun icon means "tap for light".
function showTheme() {
  const dark = currentTheme() === 'dark';
  themeBtn.dataset.mode = dark ? 'dark' : 'light';   // style.css shows the outline sun in dark mode, the moon in light mode
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



// ---------- 5. Photo scroll handle (wide screens with a mouse only) ----------
// style.css hides the browser's scrollbar there. This round photo shows where you are on the page
// and can be dragged up and down to scroll. On phones and narrow windows it never appears.
const thumb = document.querySelector('.scroll-thumb');
const siteHeader = document.querySelector('.site-header');
const wideMouse = window.matchMedia('(min-width: 1050px) and (pointer: fine)');
const THUMB_SIZE = 36;   // must match width/height of .scroll-thumb in style.css
const EDGE_GAP = 10;     // breathing room in pixels at the top (under the header) and bottom

function maxScroll() {
  return document.documentElement.scrollHeight - window.innerHeight;
}

// The vertical range the photo can travel: from just under the header to just above the window bottom.
function thumbRange() {
  const top = siteHeader.getBoundingClientRect().height + EDGE_GAP;
  const bottom = Math.max(top, window.innerHeight - THUMB_SIZE - EDGE_GAP);
  return { top, bottom };
}

function placeThumb() {
  if (!wideMouse.matches) return;
  const scrollable = maxScroll();
  thumb.hidden = scrollable <= 0;                                   // nothing to scroll: hide it
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  const { top, bottom } = thumbRange();
  thumb.style.transform = `translateY(${top + progress * (bottom - top)}px)`;
}

let thumbTicking = false;
window.addEventListener('scroll', () => {
  if (!thumbTicking) {
    window.requestAnimationFrame(() => { placeThumb(); thumbTicking = false; });
    thumbTicking = true;
  }
}, { passive: true });
window.addEventListener('resize', placeThumb);
wideMouse.addEventListener('change', placeThumb);

// Dragging: pointer events cover mouse and pen. setPointerCapture keeps the drag going
// even when the pointer slides off the small circle.
let draggingThumb = false;
thumb.addEventListener('pointerdown', (event) => {
  draggingThumb = true;
  thumb.setPointerCapture(event.pointerId);
  thumb.classList.add('dragging');
  event.preventDefault();                                           // stops the photo being dragged as an image
});
thumb.addEventListener('pointermove', (event) => {
  if (!draggingThumb) return;
  const { top, bottom } = thumbRange();
  const y = Math.min(bottom, Math.max(top, event.clientY - THUMB_SIZE / 2));
  const ratio = bottom > top ? (y - top) / (bottom - top) : 0;      // 0 = top of page, 1 = bottom
  window.scrollTo({ top: ratio * maxScroll(), behavior: 'instant' });   // 'instant' skips the smooth scrolling
});
function endThumbDrag() {
  draggingThumb = false;
  thumb.classList.remove('dragging');
}
thumb.addEventListener('pointerup', endThumbDrag);
thumb.addEventListener('pointercancel', endThumbDrag);

placeThumb();
