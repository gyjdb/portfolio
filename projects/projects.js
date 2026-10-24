import { fetchJSON, renderProjects } from '../global.js';

const container = document.querySelector('.projects');
const title = document.querySelector('.projects-title');

try {
  const projects = await fetchJSON(new URL('../lib/projects.json', import.meta.url));
  renderProjects(projects, container);
  if (title) {
    title.textContent = `Projects (${projects.length})`;
    const period = document.createElement('span');
    period.className = 'accent';
    period.textContent = '.';
    title.append(period);
  }
} catch (error) {
  console.error('Could not load projects:', error);
  if (container) {
    container.textContent = 'Projects could not be loaded. Please refresh to try again. Selected project details are available below.';
  }
} finally {
  container?.setAttribute('aria-busy', 'false');
}
