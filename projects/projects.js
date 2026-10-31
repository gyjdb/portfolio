import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const container = document.querySelector('.projects');
const title = document.querySelector('.projects-title');
const count = document.querySelector('#results-count');
const search = document.querySelector('#project-search');
const buttons = [...document.querySelectorAll('[data-filter]')];

// Lab 5: a pie chart of projects per year, whose legend doubles as the year filter.
const chart = d3.select('.year-chart');
const svg = d3.select('#projects-pie-plot');
const legend = d3.select('.legend');
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// sort(null) keeps the slices in year order, newest first from the top, instead of largest first.
const sliceGenerator = d3.pie().value(d => d.value).sort(null);
// Step 4.3 searches every value; image paths and URLs are left out so "svg" or "projects" don't match everything.
const searchFields = ['title', 'displayTitle', 'description', 'category', 'tools', 'year', 'resultValue', 'resultLabel'];

const unit = n => (n === 1 ? 'project' : 'projects');

// Unit vector through the middle of a slice. A slice that fills the circle has nowhere to move.
function sliceDirection(d) {
  if (d.endAngle - d.startAngle > 2 * Math.PI - 1e-6) return [0, 0];
  const middle = (d.startAngle + d.endAngle) / 2;
  return [Math.sin(middle), -Math.cos(middle)];
}

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

  // Each year keeps one color however the archive is filtered; --year-1 is the newest year.
  const years = [...new Set(projects.map(project => project.year))].sort((a, b) => b - a);
  const colors = d3.scaleOrdinal(years, years.map((_, i) => `var(--year-${i + 1})`));

  let activeFilter = 'all';
  // The lab's selectedIndex, kept as a year: slice indexes shift when a search hides a year.
  let selectedYear = null;
  let hoveredYear = null;

  // Hovering a slice highlights its legend entry; hovering or focusing an entry highlights its slice.
  function highlightYear(year) {
    hoveredYear = year;
    chart.classed('has-hover', year !== null);
    svg.selectAll('path').classed('is-hovered', d => d.data.label === year);
    legend.selectAll('li').classed('is-hovered', d => d.label === year);
  }

  // Selecting the selected year again shows every year.
  function selectYear(year) {
    selectedYear = selectedYear === year ? null : year;
    updateProjects();
  }

  function renderPieChart(projectsGiven) {
    const rolledData = d3.rollups(projectsGiven, v => v.length, d => d.year);
    const counts = new Map(rolledData);
    // Every year stays in the legend, at 0 when nothing matches, so the layout holds still while typing.
    const data = years.map(year => ({ label: year, value: counts.get(year) ?? 0 }));
    const arcData = sliceGenerator(data.filter(d => d.value > 0));

    // join() updates slices and legend entries in place, so re-rendering never piles up old ones.
    svg.selectAll('path')
      .data(arcData, d => d.data.label)
      .join('path')
      .attr('d', arcGenerator)
      .style('--color', d => colors(d.data.label))
      .style('--dx', d => sliceDirection(d)[0])
      .style('--dy', d => sliceDirection(d)[1])
      .classed('selected', d => d.data.label === selectedYear)
      .on('click', (event, d) => selectYear(d.data.label))
      .on('pointerenter', (event, d) => highlightYear(d.data.label))
      .on('pointerleave', () => highlightYear(null));

    const items = legend.selectAll('li')
      .data(data, d => d.label)
      .join(enter => {
        const item = enter.append('li').attr('class', 'legend-item');
        const button = item.append('button').attr('type', 'button');
        button.append('span').attr('class', 'swatch');
        button.append('span').attr('class', 'legend-label');
        const value = button.append('span').attr('class', 'legend-value');
        value.append('strong');
        value.append('span');
        return item;
      })
      .style('--color', d => colors(d.label))
      .classed('selected', d => d.label === selectedYear)
      .classed('is-empty', d => d.value === 0);
    items.select('.legend-label').text(d => d.label);
    items.select('strong').text(d => d.value);
    items.select('.legend-value span').text(d => unit(d.value));
    items.select('button')
      .attr('aria-label', d => `${d.label}: ${d.value} ${unit(d.value)}`)
      .attr('aria-pressed', d => d.label === selectedYear)
      .on('click', (event, d) => selectYear(d.label))
      .on('pointerenter focus', (event, d) => highlightYear(d.label))
      .on('pointerleave blur', () => highlightYear(null));

    highlightYear(hoveredYear);
  }

  function updateProjects() {
    const query = search.value.trim().toLowerCase();
    // Lab 5 Step 5.4: area, search, and year are applied together here, so they combine in any order.
    // The pie counts the projects that pass the area and search; the selected year then narrows the cards.
    const searched = projects.filter(project =>
      (activeFilter === 'all' || project.group === activeFilter) &&
      searchFields.map(key => project[key] ?? '').join('\n').toLowerCase().includes(query));
    const visible = searched.filter(project => selectedYear === null || project.year === selectedYear);
    renderProjects(visible, container);
    renderPieChart(searched);
    const yearNote = selectedYear === null ? '' : ` from ${selectedYear}`;
    count.textContent = `Showing ${visible.length} of ${projects.length} projects${yearNote}`;
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
      updateProjects();
    });
  }
  search.addEventListener('input', updateProjects);
  updateProjects();
  chart.attr('hidden', null);
} catch (error) {
  console.error('Could not load projects:', error);
  if (container) container.textContent = 'Projects could not be loaded. Please refresh to try again. Selected project details are available below.';
  if (count) count.textContent = 'Project data unavailable';
} finally {
  container?.setAttribute('aria-busy', 'false');
}
