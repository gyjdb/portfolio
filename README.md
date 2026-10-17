# Ethan Cai — Portfolio
GitHub Pages: https://gyjdb.github.io/portfolio/

Personal portfolio for DSC 106, built with HTML, CSS, and JavaScript.

## Pages

- Home: introduction and selected projects.
- Projects: NLP research, time-series prediction, predictive modeling, blockchain systems, and computer vision.
- Resume: education, experience, and technical skills.
- Contact: email form.

## Run locally

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
- A 12-card project gallery using an adaptive grid and row subgrid to align titles, images, and descriptions. Five cards summarize existing projects; seven are clearly marked as future coursework.
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

The home-page photograph is credited in [ASSET_CREDITS.md](ASSET_CREDITS.md).

