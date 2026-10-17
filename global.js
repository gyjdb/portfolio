console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 3: automatic navigation menu.
const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/gyjdb', title: 'GitHub' },
];

// Same result as the lab's hostname check ('/' locally, '/portfolio/' on GitHub Pages),
// read from where global.js is served, so it also works when a dev server's root is a parent folder.
const BASE_PATH = new URL('./', import.meta.url).pathname;

// Directory URLs and explicit index.html URLs represent the same page.
function normalizePath(pathname) {
  return pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '');
}

const nav = document.createElement('nav');
nav.setAttribute('aria-label', 'Main');

for (const p of pages) {
  let url = p.url;
  url = !url.startsWith('http') ? BASE_PATH + url : url;

  const a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;

  const isCurrent = a.host === location.host && normalizePath(a.pathname) === normalizePath(location.pathname);
  a.classList.toggle('current', isCurrent);
  if (isCurrent) {
    a.setAttribute('aria-current', 'page');
  }

  if (a.host !== location.host) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.insertAdjacentHTML('beforeend', ' <span aria-hidden="true">↗</span><span class="visually-hidden"> (opens in a new tab)</span>');
  }

  nav.append(a);
}

// Lab 2's header lays out the wordmark and nav side by side, so the nav goes there;
// a page without that header falls back to the lab's document.body.prepend(nav).
const header = document.querySelector('.site-header');
if (header) {
  header.append(nav);
} else {
  document.body.prepend(nav);
}

// Step 4: dark mode switch. Automatic follows the operating system.
const colorSchemeHTML = `
  <label class="color-scheme">
    Theme:
    <select name="color-scheme">
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
`;

// Placed right after the skip link so keyboard users still reach "Skip to main content" first.
const skipLink = document.querySelector('.skip-link');
if (skipLink) {
  skipLink.insertAdjacentHTML('afterend', colorSchemeHTML);
} else {
  document.body.insertAdjacentHTML('afterbegin', colorSchemeHTML);
}

const select = document.querySelector('.color-scheme select');
const colorSchemes = $$('option', select).map(option => option.value);

// Show which scheme "Automatic" currently resolves to, and keep it updated if the OS setting changes.
const osDarkMode = matchMedia('(prefers-color-scheme: dark)');
const automaticOption = select.querySelector('option[value="light dark"]');
function updateAutomaticLabel() {
  automaticOption.textContent = `Automatic (${osDarkMode.matches ? 'Dark' : 'Light'})`;
}
updateAutomaticLabel();
osDarkMode.addEventListener('change', updateAutomaticLabel);

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

try {
  if ('colorScheme' in localStorage && colorSchemes.includes(localStorage.colorScheme)) {
    setColorScheme(localStorage.colorScheme);
  }
} catch {
  // Theme switching still works when the browser blocks local storage.
}

select.addEventListener('input', event => {
  console.log('color scheme changed to', event.target.value);
  setColorScheme(event.target.value);
  try {
    localStorage.colorScheme = event.target.value;
  } catch {
    // A blocked storage setting should not interrupt the rest of the page.
  }
});

// Step 5 (optional): preserve spaces and special characters in email drafts.
const form = document.querySelector('form[action^="mailto:"]');
form?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const parameters = [];
  for (const [name, value] of data) {
    parameters.push(`${name}=${encodeURIComponent(value)}`);
  }
  location.href = `${form.action}?${parameters.join('&')}`;
});
