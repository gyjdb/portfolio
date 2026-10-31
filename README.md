# Ethan Cai — Portfolio
GitHub Pages: https://gyjdb.github.io/portfolio/

Personal portfolio for DSC 106, built with HTML, CSS, and JavaScript.

## Pages

- Home: introduction and selected projects.
- Projects: NLP research, time-series prediction, predictive modeling, blockchain systems, and computer vision.
- Resume: education, experience, and technical skills.
- Contact: email form.

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
- A 12-card project gallery using an adaptive grid and row subgrid to align titles, images, and descriptions. The gallery now includes research, completed and ongoing coursework, and two clearly identified upcoming placeholders.
- Home-page project cards that also use row subgrid, so titles, descriptions, and tools line up across columns.
- Responsive resume headings, dates, and skill categories, plus print styles.

The project thumbnails are original SVG illustrations of the project workflows; they do not display measured results.

For the Lab 2 submission, provide the repository link and an MP4 screen recording of at most one minute. Verbally show the personalized pages, resize the browser, and explain one interesting CSS concept you learned.

[Assignment instructions](https://dsc106.com/labs/lab02/)

## Lab 3: JavaScript interactions

- All four pages load the shared `global.js` module.
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

- `lib/projects.json` holds all 12 project cards, including existing research, DSC 106 Labs 1–4, the ongoing Project 2, and two clearly identified upcoming placeholders.
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

## Research redesign

The main branch contains the approved research redesign. The completed Lab 4 version with the original visual style is preserved on the lab4-original branch.

The design uses a self-hosted Inconsolata typeface, green accents, project result summaries, category/year/search filters, expandable project studies, and a shared layout across all four pages. The JSON data flow, homepage first-three selection, theme persistence, and GitHub API are retained. Research figures come from the existing project descriptions; diagrams are illustrative.

Use preview.cmd or python preview.py to run the modular website locally. The optional design-review.html comparison is a local review artifact and is excluded from version control and deployment.

Browser checks cover root and /portfolio/ hosting, all pages at 320/390/768/1440 pixels, themes, rendering, filters, deep links, and API/data failure states. Automated API checks use controlled responses for successful requests, zero counts, and failure cases.

## Lab 5: categorical data with D3

- The Projects page draws a D3 pie chart of projects per year. `d3.rollups` counts the projects in each year, `d3.pie` turns the counts into angles, and `d3.arc` draws each slice as an SVG path.
- D3 also builds the legend. Each entry shows a color swatch, the year, and its project count, so every value can be read without hovering.
- Search updates the cards, the pie chart, and the legend as you type. It ignores case and covers titles, descriptions, categories, tools, years, and results.
- Clicking a slice or a legend entry shows only that year's projects; clicking it again shows every year. The selected slice moves out slightly and the others turn gray. Legend entries are buttons with `aria-pressed`, so the year filter also works from the keyboard. They replace the Lab 4 year dropdown.
- Hovering a slice highlights its legend entry, and hovering or focusing a legend entry highlights its slice.
- Each year keeps its color when filters change. The colors are one green ramp built from the site's accent: the newest year is darkest in the light theme and lightest in the dark theme. Both ramps were checked for evenly separated steps and enough contrast against the page.
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
