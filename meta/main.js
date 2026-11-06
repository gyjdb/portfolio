import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Lab 6 Step 1.1: CSV values arrive as strings, so convert the numbers and dates.
function loadData() {
  return d3.csv(new URL('loc.csv', import.meta.url), row => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
}

// Step 1.2: the CSV has one row per line, so group the rows into one object per commit.
function processCommits(data) {
  return d3.groups(data, d => d.commit).map(([commit, lines]) => {
    const { author, date, time, timezone, datetime } = lines[0];
    const ret = {
      id: commit,
      url: `https://github.com/gyjdb/portfolio/commit/${commit}`,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
    };
    // Not enumerable, so the raw lines stay out of the way when a commit is logged.
    Object.defineProperty(ret, 'lines', { value: lines, enumerable: false });
    return ret;
  });
}

// Step 1.3: one stat from each kind the lab describes: total, distinct count, grouped aggregate, and min/max.
function renderCommitInfo(data, commits) {
  const fileLengths = d3.rollups(data, v => d3.max(v, d => d.line), d => d.file);
  const workByPeriod = d3.rollups(data, v => v.length, d => d.datetime.toLocaleString('en', { dayPeriod: 'short' }));
  const busiestPeriod = d3.greatest(workByPeriod, d => d[1])?.[0] ?? '';
  const stats = [
    ['Total <abbr title="Lines of code">LOC</abbr>', data.length],
    ['Total commits', commits.length],
    ['Files', fileLengths.length],
    ['Average file (lines)', Math.round(d3.mean(fileLengths, d => d[1]))],
    ['Longest line (chars)', d3.max(data, d => d.length)],
    // "in the evening" reads as just "evening" under the label.
    ['Busiest time', busiestPeriod.replace(/^(in the|at) /, '')],
  ];

  const dl = d3.select('#stats').html('').append('dl').attr('class', 'stats');
  for (const [label, value] of stats) {
    const item = dl.append('div');
    item.append('dt').html(label);
    item.append('dd').text(value);
  }
}

// Steps 3.1 and 3.3: fill in the tooltip and show or hide it.
function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  link.href = commit.url;
  link.textContent = commit.id;
  document.getElementById('commit-date').textContent = commit.datetime.toLocaleString('en', { dateStyle: 'full' });
  document.getElementById('commit-time').textContent = commit.datetime.toLocaleString('en', { timeStyle: 'short' });
  document.getElementById('commit-author').textContent = commit.author;
  document.getElementById('commit-lines').textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  document.getElementById('commit-tooltip').hidden = !isVisible;
}

// Step 3.4: place the tooltip beside the cursor, flipping to the other side near the viewport edges.
function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  const { width, height } = tooltip.getBoundingClientRect();
  const gap = 14;
  const left = event.clientX + gap + width > innerWidth ? event.clientX - gap - width : event.clientX + gap;
  const top = event.clientY + gap + height > innerHeight ? event.clientY - gap - height : event.clientY + gap;
  tooltip.style.left = `${Math.max(gap, left)}px`;
  tooltip.style.top = `${Math.max(gap, top)}px`;
}

// Step 5.5: show how many commits the brush holds.
function renderSelectionCount(selectedCommits) {
  const count = selectedCommits.length;
  document.querySelector('#selection-count').textContent = `${count || 'No'} ${count === 1 ? 'commit' : 'commits'} selected`;
}

// Step 5.6: count the selected commits' lines per language, largest first.
function renderLanguageBreakdown(selectedCommits) {
  const lines = selectedCommits.flatMap(d => d.lines);
  const breakdown = d3.rollups(lines, v => v.length, d => d.type);
  const container = d3.select('#language-breakdown').html('');
  for (const [language, count] of d3.sort(breakdown, d => -d[1])) {
    container.append('dt').text(language);
    container.append('dd').text(`${count} ${count === 1 ? 'line' : 'lines'} (${d3.format('.1~%')(count / lines.length)})`);
  }
}

function renderScatterPlot(commits, width) {
  // A redraw replaces the old chart, and its brush selection goes with it.
  updateTooltipVisibility(false);
  renderSelectionCount([]);
  renderLanguageBreakdown([]);

  const height = Math.max(340, width * 0.6);
  const margin = { top: 12, right: 16, bottom: 30, left: 44 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3.select('#chart')
    .html('')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', `Scatterplot of ${commits.length} commits by date and time of day. The table below lists the same commits.`)
    .style('overflow', 'visible');

  // Step 2: dates run left to right, and hours run from midnight at the bottom to midnight at the top.
  const xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();
  const yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);
  const hourTicks = d3.range(0, 25, 3);

  // Gridlines are an axis with no labels and full-width ticks. They go first so everything else sits above them.
  svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickValues(hourTicks).tickFormat('').tickSize(-usableArea.width));

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(d3.axisBottom(xScale).ticks(Math.max(3, width / 120)).tickFormat(d3.timeFormat('%b %-d')));

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickValues(hourTicks).tickFormat(d => String(d % 24).padStart(2, '0') + ':00'));

  // Step 5.4: a commit is selected when its dot's center is inside the brush rectangle.
  function isCommitSelected(selection, commit) {
    if (!selection) return false;
    const [[x0, y0], [x1, y1]] = selection;
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }

  function brushed(event) {
    const { selection, type } = event;
    // Dots ignore the mouse during a drag, so tooltips don't flash while brushing across them.
    svg.classed('brushing', type !== 'end');
    svg.selectAll('.dots circle').classed('selected', d => isCommitSelected(selection, d));
    const selectedCommits = commits.filter(d => isCommitSelected(selection, d));
    renderSelectionCount(selectedCommits);
    renderLanguageBreakdown(selectedCommits);
  }

  // Step 5.2: the brush's overlay catches mouse events, so it goes under the dots to keep their tooltips working.
  // The lab moves the dots up with raise(); starting the brush in its own group here has the same effect.
  const brush = d3.brush()
    .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
    .on('start brush end', brushed);
  const overlay = svg.append('g').attr('class', 'brush').call(brush).select('.overlay').node();

  // Step 4: a square root scale makes each dot's area, not its radius, proportional to its lines.
  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([4, Math.max(14, width * 0.03)]);
  // Largest first, so small dots are drawn on top and can still be hovered.
  const sortedCommits = d3.sort(commits, d => -d.totalLines);

  svg.append('g')
    .attr('class', 'dots')
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines))
    .on('mouseenter', (event, commit) => {
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', () => updateTooltipVisibility(false))
    // A drag that starts on a dot should still draw a brush.
    .on('mousedown', event => overlay.dispatchEvent(new MouseEvent('mousedown', event)));
}

// The same data as the chart, for keyboard and screen reader users, newest first.
function renderCommitTable(commits) {
  const rows = d3.select('#commit-rows')
    .selectAll('tr')
    .data(d3.sort(commits, d => -d.datetime))
    .join('tr');
  rows.append('td').append('a').attr('href', d => d.url).text(d => d.id);
  rows.append('td').text(d => d.datetime.toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' }));
  rows.append('td').text(d => d.author);
  rows.append('td').text(d => d.totalLines);
}

const statsContainer = document.querySelector('#stats');
try {
  const data = await loadData();
  const commits = processCommits(data);
  renderCommitInfo(data, commits);
  renderCommitTable(commits);

  // Draw at the container's real size so axis text stays readable on phones instead of shrinking with a fixed viewBox.
  // The page can load before the container has a width, so wait for one, and redraw when it changes.
  // Small changes are ignored so a scrollbar appearing can't start a redraw loop.
  const chart = document.querySelector('#chart');
  let drawnWidth = 0;
  function drawChart() {
    const width = chart.clientWidth;
    if (width > 0 && Math.abs(width - drawnWidth) >= 24) {
      drawnWidth = width;
      renderScatterPlot(commits, width);
    }
  }
  drawChart();
  new ResizeObserver(drawChart).observe(chart);
} catch (error) {
  console.error('Could not load code statistics:', error);
  statsContainer.textContent = 'Code statistics could not be loaded. Please refresh to try again.';
  document.querySelector('.commit-section').hidden = true;
} finally {
  statsContainer.setAttribute('aria-busy', 'false');
}
