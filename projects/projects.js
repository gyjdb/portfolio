import { fetchJSON, renderProjects } from '../global.js';

const container = document.querySelector('.projects');
const title = document.querySelector('.projects-title');
const count = document.querySelector('#results-count');
const search = document.querySelector('#project-search');
const year = document.querySelector('#project-year');
const buttons = [...document.querySelectorAll('[data-filter]')];

function openLinkedStudy() {
  const id = decodeURIComponent(location.hash.slice(1));
  const study = document.getElementById(id);
  if (study?.matches('details.project-study')) {
    study.open = true;
    requestAnimationFrame(() => study.scrollIntoView({ block: 'start' }));
  }
}
window.addEventListener('hashchange', openLinkedStudy);
openLinkedStudy();

// Reopen a study even when its anchor is already in the URL.
document.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href]');
  if (!link) return;
  const url = new URL(link.href);
  const samePage = url.origin === location.origin &&
    url.pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');
  if (samePage && url.hash) {
    const study = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (study?.matches('details.project-study')) study.open = true;
  }
});

try {
  const projects = await fetchJSON(new URL('../lib/projects.json', import.meta.url));
  if (!Array.isArray(projects)) throw new TypeError('Project data must be an array.');
  if (title) {
    title.textContent = 'Projects';
    const total = document.createElement('span');
    total.className = 'project-total';
    total.textContent = projects.length;
    total.setAttribute('aria-label', `${projects.length} projects`);
    title.append(total);
  }
  for (const value of [...new Set(projects.map(project => project.year))].sort((a, b) => b - a)) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    year.append(option);
  }

  let activeFilter = 'all';
  function updateProjects() {
    const query = search.value.trim().toLowerCase();
    const filtered = projects.filter(project => {
      const matchesGroup = activeFilter === 'all' || project.group === activeFilter;
      const matchesYear = year.value === 'all' || String(project.year) === year.value;
      const matchesSearch = [project.title, project.description, project.category, project.tools]
        .join(' ').toLowerCase().includes(query);
      return matchesGroup && matchesYear && matchesSearch;
    });
    renderProjects(filtered, container);
    count.textContent = `Showing ${filtered.length} of ${projects.length} projects`;
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
      updateProjects();
    });
  }
  search.addEventListener('input', updateProjects);
  year.addEventListener('change', updateProjects);
  updateProjects();
} catch (error) {
  console.error('Could not load projects:', error);
  if (container) container.textContent = 'Projects could not be loaded. Please refresh to try again. Selected project details are available below.';
  if (count) count.textContent = 'Project data unavailable';
} finally {
  container?.setAttribute('aria-busy', 'false');
}
