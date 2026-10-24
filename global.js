
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

header?.append(document.querySelector('.color-scheme'));
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


// Lab 4: share data loading and project rendering between pages.
export async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load data (${response.status} ${response.statusText}).`);
  }
  return response.json();
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement) return;
  if (!Array.isArray(projects)) throw new TypeError('Project data must be an array.');
  if (!/^h[1-6]$/.test(headingLevel)) headingLevel = 'h2';
  containerElement.replaceChildren();
  if (projects.length === 0) {
    const message = document.createElement('p');
    message.className = 'empty-message';
    message.textContent = 'No projects match this selection. Try another filter or search.';
    containerElement.append(message);
    return;
  }

  for (const project of projects) {
    const article = document.createElement('article');
    article.className = 'project-card';
    article.classList.toggle('project-placeholder', Boolean(project.placeholder));
    article.innerHTML = `
      <div class="project-kicker"><span class="project-category"></span><span class="project-year"></span></div>
      <${headingLevel}></${headingLevel}>
      <img width="720" height="450" loading="lazy">
      <p class="project-description"></p>
      <p class="project-result"></p>
      <div class="project-footer"><span class="tools"></span></div>
    `;
    article.querySelector('.project-category').textContent = project.category || 'Project';
    article.querySelector('.project-year').textContent = project.year || 'Undated';
    const title = article.querySelector(headingLevel);
    title.textContent = project.displayTitle || project.title || 'Untitled project';
    let projectURL;
    if (project.url) {
      const candidate = new URL(project.url, import.meta.url);
      if (['http:', 'https:'].includes(candidate.protocol)) {
        projectURL = candidate.href;
        const link = document.createElement('a');
        link.href = projectURL;
        link.textContent = title.textContent;
        title.replaceChildren(link);
      }
    }
    const image = article.querySelector('img');
    image.src = new URL(project.image || 'images/upcoming-project.svg', import.meta.url).href;
    image.alt = project.alt || project.title || 'Project illustration';
    image.addEventListener('error', () => {
      image.src = new URL('images/upcoming-project.svg', import.meta.url).href;
      image.alt = 'Project illustration unavailable.';
    }, { once: true });
    article.querySelector('.project-description').textContent = project.description || 'Description coming soon.';
    const result = article.querySelector('.project-result');
    if (project.resultValue) {
      const value = document.createElement('strong');
      value.textContent = project.resultValue;
      result.append(value, document.createTextNode(` ${project.resultLabel || ''}`));
    } else {
      result.textContent = project.resultLabel || (project.placeholder ? 'Planned coursework' : 'Project notes');
    }
    article.querySelector('.tools').textContent = project.tools || '';
    if (projectURL) {
      const link = document.createElement('a');
      link.href = projectURL;
      link.textContent = '↗';
      link.setAttribute('aria-label', `View ${project.title}`);
      article.querySelector('.project-footer').append(link);
    } else {
      const label = document.createElement('span');
      label.className = 'tools';
      label.textContent = 'Planned';
      article.querySelector('.project-footer').append(label);
    }
    containerElement.append(article);
  }
}

export function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${encodeURIComponent(username)}`);
}
