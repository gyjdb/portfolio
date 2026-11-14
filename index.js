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

// The certainty slider: at 0 the three words share one weight, at 1 each has its own.
// CSS turns --certainty into font weights and plays the opening once; this keeps the numbers in step.
function setUpCertainty() {
  const specimen = document.querySelector('.specimen');
  const slider = document.querySelector('#certainty');
  if (!specimen || !slider) return;
  const output = document.querySelector('#certainty-value');
  const words = [...specimen.querySelectorAll('.word')].map(word => ({
    readout: word.querySelector('small b'),
    to: Number(word.style.getPropertyValue('--to')),
  }));

  function show(certainty) {
    slider.value = certainty;
    output.textContent = certainty.toFixed(2);
    for (const { readout, to } of words) readout.textContent = Math.round(480 + (to - 480) * certainty);
  }

  // While the opening animation runs, read the value it has reached on each frame.
  let frame = 0;
  function follow() {
    show(Number(getComputedStyle(specimen).getPropertyValue('--certainty')));
    if (specimen.getAnimations().length) frame = requestAnimationFrame(follow);
  }
  follow();

  slider.addEventListener('input', () => {
    // Moving the slider takes over from the animation.
    cancelAnimationFrame(frame);
    for (const animation of specimen.getAnimations()) animation.cancel();
    specimen.style.setProperty('--certainty', slider.value);
    show(Number(slider.value));
  });
}

// Independent requests: an API failure must not prevent the project gallery loading.
setUpCertainty();
loadProjects();
loadGitHubStats();
