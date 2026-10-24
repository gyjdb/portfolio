import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

async function loadProjects() {
  const container = document.querySelector('.home-work .projects');
  if (!container) return;
  try {
    const projects = await fetchJSON(new URL('./lib/projects.json', import.meta.url));
    if (!Array.isArray(projects)) throw new TypeError('Project data must be an array.');
    renderProjects(projects.slice(0, 3), container, 'h3');
  } catch (error) {
    console.error('Could not load projects:', error);
    container.textContent = 'Projects could not be loaded. Please refresh to try again.';
  } finally {
    container.setAttribute('aria-busy', 'false');
  }
}

async function loadGitHubStats() {
  const container = document.querySelector('#profile-stats');
  if (!container) return;
  try {
    const data = await fetchGitHubData('gyjdb');
    const fields = [
      ['Public repos', 'public_repos'],
      ['Public gists', 'public_gists'],
      ['Followers', 'followers'],
      ['Following', 'following'],
    ];
    const list = document.createElement('dl');
    for (const [label, key] of fields) {
      if (!Number.isInteger(data[key]) || data[key] < 0) {
        throw new TypeError('Invalid GitHub profile statistics.');
      }
      const group = document.createElement('div');
      const term = document.createElement('dt');
      const value = document.createElement('dd');
      term.textContent = label;
      value.textContent = data[key].toLocaleString();
      group.append(term, value);
      list.append(group);
    }
    container.replaceChildren(list);
  } catch (error) {
    console.error('Could not load GitHub statistics:', error);
    const message = document.createElement('p');
    message.className = 'status-message';
    message.textContent = 'GitHub statistics are temporarily unavailable. ';
    const link = document.createElement('a');
    link.href = 'https://github.com/gyjdb';
    link.textContent = 'View my GitHub profile';
    message.append(link);
    container.replaceChildren(message);
  } finally {
    container.setAttribute('aria-busy', 'false');
  }
}

// Independent requests: an API failure must not prevent the project gallery loading.
loadProjects();
loadGitHubStats();
