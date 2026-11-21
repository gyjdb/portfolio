import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';

// Lab 6 Step 1.1: CSV values arrive as strings, so convert the numbers and dates.
function loadData() {
  return d3.csv(new URL('loc.csv', import.meta.url), row => ({
    ...row,
    // elocuent writes Windows paths with backslashes (character 92); show them the way the site's URLs read.
    file: row.file.split(String.fromCharCode(92)).join('/'),
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
}

// Each commit's message, written out by `git log` (see the README). The page still works without the file.
async function loadSubjects() {
  try {
    return await d3.tsv(new URL('commits.tsv', import.meta.url));
  } catch {
    return [];
  }
}

// Lab 6 Step 1.2: the CSV has one row per line, so group the rows into one object per commit.
// Lab 8 Step 3.3: the commits are sorted by time, because the story walks through them in order.
function processCommits(data, subjects = []) {
  const commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
    const { author, date, time, timezone, datetime } = lines[0];
    const ret = {
      id: commit,
      url: `https://github.com/gyjdb/portfolio/commit/${commit}`,
      // loc.csv shortens the hash, so the full hash is matched on its start.
      subject: subjects.find(row => row.commit.startsWith(commit))?.subject ?? `Commit ${commit}`,
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
  return d3.sort(commits, d => d.datetime);
}

// Lab 6 Step 1.3: one stat from each kind the lab describes: total, distinct count, grouped aggregate, and min/max.
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

// Lab 6 Steps 3.1 and 3.3: fill in the tooltip and show or hide it.
function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  link.href = commit.url;
  link.textContent = commit.id;
  document.getElementById('commit-date').textContent = commit.datetime.toLocaleString('en', { dateStyle: 'full' });
  document.getElementById('commit-tooltip-time').textContent = commit.datetime.toLocaleString('en', { timeStyle: 'short' });
  document.getElementById('commit-author').textContent = commit.author;
  document.getElementById('commit-lines').textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  document.getElementById('commit-tooltip').hidden = !isVisible;
}

// Lab 6 Step 3.4: place the tooltip beside the cursor, flipping to the other side near the viewport edges.
function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  const { width, height } = tooltip.getBoundingClientRect();
  const gap = 14;
  const left = event.clientX + gap + width > innerWidth ? event.clientX - gap - width : event.clientX + gap;
  const top = event.clientY + gap + height > innerHeight ? event.clientY - gap - height : event.clientY + gap;
  tooltip.style.left = `${Math.max(gap, left)}px`;
  tooltip.style.top = `${Math.max(gap, top)}px`;
}

// Lab 8 Step 2.4: an ordinal scale gives each technology its own color. The colors are CSS variables,
// so they follow the light and dark themes. A type that is not listed here falls back to gray.
const technologies = ['js', 'css', 'html'];
const colors = d3.scaleOrdinal(technologies, technologies.map(type => `var(--lang-${type})`)).unknown('var(--muted)');

// Lab 6 Step 5.5: show how many commits the brush holds.
function renderSelectionCount(selectedCommits) {
  const count = selectedCommits.length;
  document.querySelector('#selection-count').textContent = `${count || 'No'} ${count === 1 ? 'commit' : 'commits'} selected`;
}

// Lab 6 Step 5.6: count lines per language, largest first. With nothing selected it covers the commits
// on the chart, so the panel shows the codebase at that moment instead of sitting empty.
function renderLanguageBreakdown(selectedCommits, shownCommits, totalCommits) {
  const hasSelection = selectedCommits.length > 0;
  const lines = (hasSelection ? selectedCommits : shownCommits).flatMap(d => d.lines);
  const breakdown = d3.rollups(lines, v => v.length, d => d.type);
  const scope = hasSelection
    ? 'selected commits'
    : shownCommits.length === totalCommits
      ? `all ${totalCommits} commits`
      : `${shownCommits.length} of ${totalCommits} commits`;
  document.querySelector('#language-scope').textContent = `Lines by language, ${scope}`;
  const container = d3.select('#language-breakdown').html('');
  for (const [language, count] of d3.sort(breakdown, d => -d[1])) {
    const share = count / lines.length;
    // --share sets the length of the row's bar in CSS, and --color its color.
    const row = container.append('div').style('--share', share).style('--color', colors(language));
    row.append('dt').text(language);
    row.append('dd').text(`${count} ${count === 1 ? 'line' : 'lines'} (${d3.format('.1~%')(share)})`);
  }
}

// The chart's scales are shared by the function that builds the chart and the one that updates its dots.
let xScale;
let yScale;
let rScale;
// The commits on the chart right now, and a way to work out the brush selection again after they change.
let shownCommits = [];
let applyBrush = () => {};
let brushOverlay;

// Builds the empty chart: axes, gridlines, and the brush. updateScatterPlot() then draws the dots.
// The scales cover every commit, so a dot keeps its place and size while the time filter moves.
function renderScatterPlot(commits, width, height) {
  // A redraw replaces the old chart, and its brush selection goes with it.
  updateTooltipVisibility(false);

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
    .style('overflow', 'visible');

  // Lab 6 Step 2: dates run left to right, and hours run from midnight at the bottom to midnight at the top.
  // A little time is added before the first commit and after the last, so their dots don't hang off the plot.
  const [firstCommit, lastCommit] = d3.extent(commits, d => d.datetime);
  const padding = (lastCommit - firstCommit) * 0.04;
  xScale = d3.scaleTime()
    .domain([new Date(firstCommit - padding), new Date(+lastCommit + padding)])
    .range([usableArea.left, usableArea.right]);
  yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);
  // A short chart gets a label every six hours instead of every three.
  const hourTicks = d3.range(0, 25, height < 280 ? 6 : 3);

  // Gridlines are an axis with no labels and full-width ticks. They go first so everything else sits above them.
  svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickValues(hourTicks).tickFormat('').tickSize(-usableArea.width));

  // D3 suggests about eight date ticks. On a narrow chart every other one is dropped until the labels have room.
  const roomFor = Math.max(3, Math.floor(usableArea.width / 80));
  let dateTicks = xScale.ticks(8);
  while (dateTicks.length > roomFor + 1) dateTicks = dateTicks.filter((tick, i) => i % 2 === 0);
  svg.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(d3.axisBottom(xScale).tickValues(dateTicks).tickFormat(d3.timeFormat('%b %-d')));

  svg.append('g')
    .attr('class', 'axis y-axis')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickValues(hourTicks).tickFormat(d => String(d % 24).padStart(2, '0') + ':00'));

  // Lab 6 Step 5.4: a commit is selected when its dot's center is inside the brush rectangle.
  function isCommitSelected(selection, commit) {
    if (!selection) return false;
    const [[x0, y0], [x1, y1]] = selection;
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }

  function markSelection(selection) {
    svg.selectAll('.dots circle').classed('selected', d => isCommitSelected(selection, d));
    const selectedCommits = shownCommits.filter(d => isCommitSelected(selection, d));
    renderSelectionCount(selectedCommits);
    renderLanguageBreakdown(selectedCommits, shownCommits, commits.length);
  }

  function brushed(event) {
    // Dots ignore the mouse during a drag, so tooltips don't flash while brushing across them.
    svg.classed('brushing', event.type !== 'end');
    markSelection(event.selection);
  }

  // Lab 6 Step 5.2: the brush's overlay catches mouse events, so it goes under the dots to keep their tooltips working.
  // The lab moves the dots up with raise(); starting the brush in its own group here has the same effect.
  const brush = d3.brush()
    .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
    .on('start brush end', brushed);
  const brushGroup = svg.append('g').attr('class', 'brush').call(brush);
  brushOverlay = brushGroup.select('.overlay').node();
  applyBrush = () => markSelection(d3.brushSelection(brushGroup.node()));

  // Lab 6 Step 4: a square root scale makes each dot's area, not its radius, proportional to its lines.
  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
  rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([4, Math.max(14, width * 0.03)]);

  svg.append('g').attr('class', 'dots');
}

// Lab 8 Steps 1.2 and 1.3: draw the commits made up to the chosen time. The key ties each circle to its
// commit, so a circle that is already on the chart stays where it is and only new ones are added.
// The lab also rescales the x-axis to the commits shown. Here the axis keeps the whole timeline,
// so the chart fills up from left to right instead of every dot moving at each step.
function updateScatterPlot(commits) {
  shownCommits = commits;
  const svg = d3.select('#chart').select('svg');
  if (svg.empty()) return;
  svg.attr('aria-label', `Scatterplot of ${commits.length} ${commits.length === 1 ? 'commit' : 'commits'} by date and time of day. The table below lists every commit.`);

  // Largest first, so small dots are drawn on top and can still be hovered.
  const sortedCommits = d3.sort(commits, d => -d.totalLines);
  svg.select('g.dots')
    .selectAll('circle')
    .data(sortedCommits, d => d.id)
    .join('circle')
    .order()
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
    .on('mousedown', event => brushOverlay.dispatchEvent(new MouseEvent('mousedown', event)));
  applyBrush();
}

// Moves rows smoothly to their new places when their order changes: note where each row is,
// let the update happen, then animate each row from its old place to its new one.
function animateReorder(container, update) {
  const before = new Map(Array.from(container.children, row => [row, row.getBoundingClientRect().top]));
  update();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (const row of container.children) {
    const moved = before.get(row) - row.getBoundingClientRect().top;
    if (Math.abs(moved) > 1) {
      row.animate(
        [{ transform: `translateY(${moved}px)` }, { transform: 'none' }],
        { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      );
    }
  }
}

// Lab 8 Step 2: a unit chart. Each file gets a row, and each of its lines gets a dot.
function updateFileDisplay(commits) {
  const lines = commits.flatMap(d => d.lines);
  // Step 2.3: the largest file comes first, which turns the list into a race as the commits go by.
  const files = d3.groups(lines, d => d.file)
    .map(([name, lines]) => ({ name, lines }))
    .sort((a, b) => b.lines.length - a.lines.length);

  const container = document.getElementById('files');
  animateReorder(container, () => {
    // ':scope > div' keeps the selection to the file rows. A plain 'div' would also match the dots inside them.
    const filesContainer = d3.select(container)
      .selectAll(':scope > div')
      .data(files, d => d.name)
      .join(enter => enter.append('div').call(div => {
        const term = div.append('dt');
        term.append('code');
        term.append('small');
        div.append('dd').attr('aria-hidden', 'true');
      }))
      .order();
    filesContainer.select('dt > code').text(d => d.name);
    filesContainer.select('dt > small').text(d => `${d.lines.length} ${d.lines.length === 1 ? 'line' : 'lines'}`);
    // Step 2.2: one dot per line. Step 2.4: the dot's color is the line's technology.
    filesContainer.select('dd')
      .selectAll('div')
      .data(d => d.lines)
      .join('div')
      .attr('class', 'loc')
      .style('--color', d => colors(d.type));
  });
}

// The legend lists the technologies that are in the data, in a fixed order.
function renderLanguageLegend(data) {
  const present = new Set(data.map(d => d.type));
  const others = [...present].filter(type => !technologies.includes(type)).sort();
  d3.select('#language-legend')
    .selectAll('li')
    .data([...technologies.filter(type => present.has(type)), ...others])
    .join('li')
    .style('--color', d => colors(d))
    .text(d => d);
}

// Lab 8 Step 3.2: one step of the story for each commit: when it was made, what it was for,
// and how much of it is still in the site.
function renderStory(commits) {
  const steps = d3.select('#scatter-story')
    .selectAll('.step')
    .data(commits)
    .join('div')
    .attr('class', 'step');
  steps.append('p')
    .attr('class', 'meta')
    .append('time')
    .attr('datetime', d => d.datetime.toISOString())
    .text(d => d.datetime.toLocaleString('en', { dateStyle: 'full', timeStyle: 'short' }));
  const link = steps.append('h3')
    .append('a')
    .attr('href', d => d.url)
    .attr('target', '_blank')
    .attr('rel', 'noopener noreferrer');
  link.append('span').text(d => d.subject);
  link.append('span').attr('class', 'arrow out').attr('aria-hidden', 'true');
  link.append('span').attr('class', 'visually-hidden').text(' (opens in a new tab)');
  steps.append('p').text((d, i) => {
    const files = new Set(d.lines.map(line => line.file)).size;
    const kept = d.totalLines === 1 ? '1 line from this commit is' : `${d.totalLines} lines from this commit are`;
    return `${i === 0 ? 'The first commit. ' : ''}${kept} still in the site, in ${files} ${files === 1 ? 'file' : 'files'}.`;
  });
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
  const [data, subjects] = await Promise.all([loadData(), loadSubjects()]);
  const commits = processCommits(data, subjects);
  renderCommitInfo(data, commits);
  renderCommitTable(commits);
  renderLanguageLegend(data);
  renderStory(commits);

  // Lab 8 Step 1.1: the slider runs from 0 to 100, and a time scale turns that number into a date.
  const slider = document.querySelector('#commit-progress');
  const timeLabel = document.querySelector('#commit-time');
  const summary = document.querySelector('#commit-summary');
  const steps = [...document.querySelectorAll('#scatter-story .step')];
  const timeScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([0, 100]);
  // The page opens at the start of the story, when only the first commit had been made.
  let commitProgress = 0;
  let commitMaxTime = commits[0].datetime;
  // Step 1.2: the commits made up to that time. It is worked out again whenever the time changes.
  let filteredCommits = commits;

  // Shows the site as it was at commitMaxTime: the slider, the two charts, and the story's current step.
  function showCommits() {
    filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
    const timeText = commitMaxTime.toLocaleString('en', { dateStyle: 'long', timeStyle: 'short' });
    slider.value = commitProgress;
    slider.setAttribute('aria-valuetext', timeText);
    // --progress fills the slider's track up to the handle.
    slider.style.setProperty('--progress', commitProgress / 100);
    timeLabel.dateTime = commitMaxTime.toISOString();
    timeLabel.textContent = timeText;

    const lineCount = d3.sum(filteredCommits, d => d.totalLines);
    const fileCount = new Set(filteredCommits.flatMap(d => d.lines.map(line => line.file))).size;
    const plural = (count, word) => `${d3.format(',')(count)} ${word}${count === 1 ? '' : 's'}`;
    summary.textContent = `${plural(filteredCommits.length, 'commit')}, ${plural(lineCount, 'line')}, ${plural(fileCount, 'file')}`;

    // The story's current step is the latest commit on the chart.
    const current = filteredCommits.at(-1);
    for (const step of steps) step.classList.toggle('is-active', step.__data__ === current);

    updateScatterPlot(filteredCommits);
    updateFileDisplay(filteredCommits);
  }

  function onTimeSliderChange() {
    commitProgress = Number(slider.value);
    commitMaxTime = timeScale.invert(commitProgress);
    showCommits();
  }
  slider.addEventListener('input', onTimeSliderChange);

  // Draw at the container's real size so axis text stays readable on phones instead of shrinking with a fixed viewBox.
  // The chart shares the window with the slider and the file dots, so its height follows the window's height.
  // The page can load before the container has a width, so wait for one, and redraw when the size changes.
  // Small changes are ignored so a scrollbar appearing can't start a redraw loop.
  const chart = document.querySelector('#chart');
  let drawnWidth = 0;
  let drawnHeight = 0;
  function drawChart() {
    const width = chart.clientWidth;
    const height = Math.round(Math.max(200, Math.min(width * 0.6, Math.max(220, innerHeight * 0.36))));
    if (width > 0 && (Math.abs(width - drawnWidth) >= 24 || Math.abs(height - drawnHeight) >= 24)) {
      drawnWidth = width;
      drawnHeight = height;
      renderScatterPlot(commits, width, height);
      updateScatterPlot(filteredCommits);
    }
  }
  showCommits();
  drawChart();
  new ResizeObserver(drawChart).observe(chart);
  addEventListener('resize', drawChart);

  // Lab 8 Step 3.3: when a commit's step crosses the trigger line, show the site as it was at that commit.
  function onStepEnter(response) {
    const commit = response.element.__data__;
    commitMaxTime = commit.datetime;
    commitProgress = timeScale(commit.datetime);
    showCommits();
  }

  // Beside the charts the trigger line is the middle of the window. When the chart is pinned to the top
  // instead (narrow windows), the line is halfway down the part of the window left under the pinned chart.
  const pinnedOnTop = matchMedia('(max-width: 1179px)');
  const pin = document.querySelector('.pin');
  const triggerLine = () => (pinnedOnTop.matches ? Math.min(0.85, (pin.offsetHeight + innerHeight) / 2 / innerHeight) : 0.5);
  const scroller = scrollama();
  scroller
    .setup({ step: '#scrolly-1 .step', offset: triggerLine() })
    .onStepEnter(onStepEnter);
  addEventListener('resize', () => {
    scroller.offset(triggerLine());
    scroller.resize();
  });
} catch (error) {
  console.error('Could not load code statistics:', error);
  statsContainer.textContent = 'Code statistics could not be loaded. Please refresh to try again.';
  document.querySelector('.commit-section').hidden = true;
} finally {
  statsContainer.setAttribute('aria-busy', 'false');
}
