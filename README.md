# Ethan Cai — Portfolio
GitHub Pages: https://gyjdb.github.io/portfolio/

Personal portfolio for DSC 106, built with HTML, CSS, and JavaScript.

## Pages

- Home: introduction and selected projects.
- Projects: NLP research, time-series prediction, predictive modeling, blockchain systems, computer vision, and DSC 106 coursework.
- Resume: education, experience, and technical skills.
- Contact: email form.
- Meta: statistics and a commit chart generated from this repository's own code.

## Run locally

On Windows, double-click `preview.cmd` to start a local server and open your browser. Keep the terminal window open while reviewing. Alternatively, run `python preview.py`.

Serve this directory with a local HTTP server (JavaScript modules do not work when opening HTML files directly):

```sh
python -m http.server 8000
```

Then open http://localhost:8000.

## Deployment

Use this directory as the repository root. In GitHub Pages settings, select the `main` branch and `/(root)` folder.

## Lab 2: CSS layout

- A centered, padded page with a relative maximum width.
- Flexbox navigation with equal space, a bottom border and margin, a current-page indicator, and hover styles.
- A site-wide `--color-accent` custom property and inherited form typography.
- A contact form using Grid and column subgrid; labels stack above fields on small screens.
- A 13-card project gallery using an adaptive grid and row subgrid to align titles, images, and descriptions. The gallery now includes research and coursework, and every card has its own illustration.
- Home-page project cards that also use row subgrid, so titles, descriptions, and tools line up across columns.
- Responsive resume headings, dates, and skill categories, plus print styles.

The project thumbnails are original SVG illustrations of the project workflows; they do not display measured results. The Bikewatching card is the exception: it shows a screenshot of the map.

For the Lab 2 submission, provide the repository link and an MP4 screen recording of at most one minute. Verbally show the personalized pages, resize the browser, and explain one interesting CSS concept you learned.

[Assignment instructions](https://dsc106.com/labs/lab02/)

## Lab 3: JavaScript interactions

- Every page loads the shared `global.js` module.
- Navigation is generated from one page list. The current page receives a visible underline and `aria-current="page"`; external navigation links open in a new tab.
- `BASE_PATH` is read from where `global.js` is served (`/` locally, `/portfolio/` on GitHub Pages), so both local hosting and the `/portfolio/` GitHub Pages path work. Directory URLs and `index.html` URLs highlight the same page.
- The top-right theme control offers Automatic, Light, and Dark. Automatic follows the operating system and shows which scheme it currently resolves to; `localStorage` keeps the selection across refreshes and page navigation.
- Theme-aware colors cover text, navigation, buttons, forms, borders, keyboard focus, and the project illustrations. Printing uses the light palette.
- Optional contact-form improvement: subject and message are percent-encoded into an email draft, preserving spaces, Unicode, and special characters. The sender address comes from the email app.

For the Lab 3 submission, provide the repository and live website links, plus an MP4 screen recording no longer than one minute. Verbally show the site, switch between all three themes, refresh to demonstrate persistence, and share one interesting thing you learned.

[Lab 3 instructions](https://dsc106.com/labs/lab03/)

## Notes

The contact form uses `mailto:` and requires a configured email application.

Image and font credits are listed in [ASSET_CREDITS.md](ASSET_CREDITS.md). The original Hubble photograph remains visible on the home page with descriptive alternative text, preserving Lab 1's photo requirement.



## Lab 4: data-driven projects and GitHub statistics

- `lib/projects.json` holds every project card: the research projects, the DSC 106 labs, and the ongoing Project 2.
- Every entry includes a numeric `year`. Existing project dates supply the 2024–2026 range; coursework uses 2026.
- `global.js` exports `fetchJSON`, `renderProjects`, and `fetchGitHubData`.
- `projects/projects.js` renders all cards and updates the title with the project count.
- `index.js` renders the first three entries as selected work using `h3` headings, and fetches live public repos, public gists, followers, and following for `gyjdb`. The JSON order determines the selected projects; it is not automatically sorted by year.
- Local asset paths resolve relative to `global.js`, so cards work at both the site root and the GitHub Pages `/portfolio/` prefix.
- Loading, empty, and error states are included. A failed GitHub request does not prevent project rendering, and zero followers/following display as zero.
- Existing theme controls, navigation, contact form, and detailed project write-ups remain available.

Run the HTTP server as described above; opening an HTML file directly will not load modules or JSON.

### Submission

Submit the repository link, deployed website link, and an MP4 screen recording of at most one minute. Narrate the new JavaScript features, one interesting thing you learned, and one Think About It answer. The tutorial also asks classmates to follow one another, with at least three followers and three following; the site displays the account's actual API data.

Suggested short narration (about 45–55 seconds):

> This is my updated portfolio for Lab Four. On the home page, JavaScript loads the first three projects from a shared JSON file. Below, GitHub's API provides my repository, gist, follower, and following counts.
>
> The Projects page renders all twelve projects and counts them automatically. Each has a numeric year. I can search, filter by category and year, and open project details.
>
> The most useful thing I learned is how reusable functions keep multiple pages consistent. For the Think About It question, I clear the container before rendering again, so filtering replaces the old cards instead of creating duplicates.

Recording sequence: show the three selected projects and GitHub statistics on Home; open Projects and show the total of twelve; choose Research & systems, select 2026, search RoBERTa, and open the matching project study. Finish with the learning point and Think About It answer. Rehearse once and keep the MP4 at most 60 seconds.

[Lab 4 instructions](https://dsc106.com/labs/lab04/)

## Design

The site is set like a type specimen. Roboto Serif carries the headings, the text, the navigation, and the controls. Martian Mono is kept for measurements: weight readouts, dates, counts, and chart axes. Both are variable fonts, hosted in `fonts/`. The palette is paper, ink, and one blue accent, each with a dark counterpart.

On the home page, font weight stands for certainty. When the page loads, the three words of the opening line settle from one shared weight into three: 900, 480, and 100. The Certainty slider beside them sets the same value by hand. A registered custom property, `--certainty`, drives the weights in CSS, and `index.js` only keeps the numeric readouts in step. With reduced motion turned on, the words start at their final weights.

Project cards lead with a measured result when the project has one; a card without one starts with its title. The figures come from the project write-ups, and the illustrations are diagrams, not data. Each card is one link: the title carries an arrow, and the whole card opens the project.

Earlier versions of the design are in the Git history, and the Lab 4 version with its original style is on the `lab4-original` branch.

## Lab 5: categorical data with D3

- The Projects page draws a D3 pie chart of projects per year. `d3.rollups` counts the projects in each year, `d3.pie` turns the counts into angles, and `d3.arc` draws each slice as an SVG path.
- D3 also builds the legend. Each entry shows a color swatch, the year, and its project count, so every value can be read without hovering.
- Search updates the cards, the pie chart, and the legend as you type. It ignores case and covers titles, descriptions, categories, tools, years, and results.
- Clicking a slice or a legend entry shows only that year's projects; clicking it again shows every year. The selected slice moves out slightly and the others turn gray. Legend entries are buttons with `aria-pressed`, so the year filter also works from the keyboard. They replace the Lab 4 year dropdown.
- Hovering a slice highlights its legend entry, and hovering or focusing a legend entry highlights its slice.
- Each year keeps its color when filters change. The colors are one blue ramp built from the site's accent: the newest year is darkest in the light theme and lightest in the dark theme. Both ramps were checked for evenly separated steps and enough contrast against the page.
- The Lab 5 project card now describes this chart instead of a placeholder.

### Step 5.4: combining search and the pie filter

In the lab's starter code, the search listener filters the full `projects` array by the query alone, and the slice click handler filters the full array by the year alone. Each handler starts again from every project, so whichever runs last discards the other filter: search, then click a slice, and the search is ignored.

Here the query, the area tab, and the selected year are shared state, applied together in `updateProjects()` in `projects/projects.js`. The search box, the area tabs, and the slice and legend clicks all call it. The pie counts the projects that match the area and search; the selected year then narrows the cards. The selection is stored as a year rather than a slice index, because slice indexes shift when a search removes a year.

### Submission

Submit the repository link, the deployed website link, and a narrated screen recording of at most one minute, recorded on a computer. Show the visualization, interact with it, explain the Step 5.4 issue and which lines fix it, and share the most interesting thing you learned. Showing the fixed interaction earns 10% extra credit.

Suggested short narration (about 50 seconds):

> This is my portfolio for Lab Five. The Projects page now has a D3 pie chart of projects per year, with a legend showing each year's count.
>
> Hovering a slice highlights its legend entry. Clicking a slice or a year filters the cards, and clicking again clears it. Search updates the cards and the chart together.
>
> In the lab's starter code, searching and then clicking a slice doesn't combine, because each handler re-filters the full project list by its own condition. I keep the query, area, and year as shared state and apply all three in updateProjects, so searching Python and clicking 2025 shows only the two 2025 projects that use Python.
>
> The most interesting thing I learned is how D3's pie and arc generators turn plain counts into SVG paths.

Recording sequence: open Projects; hover the 2025 slice, click it, then click it again; type Python in the search and click the 2025 slice; show `updateProjects()` in `projects/projects.js`; finish with the learning point. Rehearse once and keep the recording at most 60 seconds.

[Lab 5 instructions](https://dsc106.com/labs/lab05/)

## Lab 6: quantitative data with D3

- A new Meta page, linked from the navigation, reads `meta/loc.csv` and turns its rows into one object per commit (`meta/main.js`).
- The summary shows total lines of code, total commits, file count, average file length, longest line, and the busiest time of day.
- A D3 scatterplot places each commit by date and time of day. Dot area is proportional to the lines the commit still has in the site, using a square root scale, and small dots are drawn on top so they can be hovered.
- Hovering a dot shows a tooltip with the commit link, date, time, author, and lines. It stays open if the mouse moves onto it, so the link can be clicked.
- Dragging across the chart brushes commits. Selected dots keep their color and the rest turn gray. The panel beside the chart shows how many are selected and their lines per language, with a bar for each language's share. With nothing selected, it covers every commit.
- The chart also has a table view with the same commits for keyboard and screen reader users. Brushing itself needs a mouse or touch.
- The chart is drawn at the width of its container, so axis text stays readable on phones, and redrawn when that width changes, which clears any selection.

Generated files: `node_modules/` is ignored; `meta/loc.csv` and `meta/commits.tsv` are committed. The CSV comes from `git blame`, so it only includes commits that still have lines in the site. The TSV holds each commit's message, for the Lab 8 story. Regenerate both after each code commit (in Git Bash), then commit them:

```sh
npm install
npx elocuent -d . -o meta/loc.csv --spaces 2
(printf 'commit\tsubject\n'; git log --format='%H%x09%s') > meta/commits.tsv
```

### Submission

Record a narrated mp4 of at most one minute on a computer: present the visualizations, interact with them, then share the most interesting thing you learned.

Suggested short narration (about 40 seconds):

> This is my Lab 6 Meta page. It shows stats about my site's code and a D3 scatterplot of my commits by date and time of day. Bigger dots touched more lines. Hovering a dot shows its details in a tooltip. Dragging across the chart selects commits, and the panel shows how many and which languages. The most interesting thing I learned is that dot size needs a square root scale, because area grows with the square of the radius.

Recording sequence: open Meta and show the summary; point to a large and a small dot; hover one dot; drag across several dots and show the selection panel; finish with the learning point.

[Lab 6 instructions](https://dsc106.com/labs/lab06/)

## Lab 8: animation and scrollytelling

- The Meta page now tells the story of the codebase. Each commit that still has lines in the site is a step of text. As a step crosses the middle of the window, the charts show the site as it was at that commit. Scrollama watches the steps (`meta/main.js`).
- A slider, "Show commits until:", sets the same moment by hand. A time scale maps its 0 to 100 onto the range of commit dates.
- The scatterplot is updated in place. Circles are joined by commit id, so a circle already on the chart keeps its element, and a new circle grows in through a CSS `@starting-style` rule.
- The lab rescales the x-axis to the commits shown. Here the axes keep the whole timeline, so the chart fills from left to right instead of every dot moving at each step.
- A unit chart draws one dot for every line of code, grouped by file and colored by technology. Files are sorted by size, and a row slides to its new place when the order changes.
- JS, CSS, and HTML each have a color, checked for color-blind separation in the light and dark themes. The language bars beside the chart use the same colors.
- The story's text comes from the commit messages in `meta/commits.tsv`, and each step says how many of that commit's lines are still in the site.
- On a narrow screen the slider and chart are pinned to the top and the story scrolls under them.
- With "reduce motion" turned on in the operating system, nothing moves or grows; new dots fade in instead.
- Lab 6's tooltip, brush, selection panel, and commit table work on the commits currently shown.

### Submission

Record a narrated video of at most one minute on a computer, in this order: scroll the page and show the scatterplot updating, show the unit chart, then share the most interesting thing you learned. The unit chart does not need its own scrollytelling.

[Lab 8 instructions](https://dsc106.com/labs/lab08/)

## Lab 7: Bikewatching

Lab 7 is a separate site, [Bikewatching](https://gyjdb.github.io/bikewatching/) ([repository](https://github.com/gyjdb/bikewatching)): an interactive map of a month of Bluebikes rides around Boston and Cambridge, built with Mapbox GL JS and D3.

In this repository, Step 7 adds its card to `lib/projects.json`, with a screenshot of the map at 8:30 AM. `images/bikewatching.svg` holds a light and a dark screenshot and shows the one that matches the page's theme. The card is marked `"wide"` in the JSON, so it takes a whole row where the grid has more than one column and shows the map as a strip. Every project has a `url` field, and `renderProjects` in `global.js` links each card's title to it.

[Lab 7 instructions](https://dsc106.com/labs/lab07/)
