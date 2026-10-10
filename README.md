# Ethan Cai — Portfolio
GitHub Pages: https://gyjdb.github.io/portfolio/

Personal portfolio for DSC 106, built with HTML and CSS.

## Pages

- Home: introduction and selected projects.
- Projects: NLP research, time-series prediction, predictive modeling, blockchain systems, and computer vision.
- Resume: education, experience, and technical skills.
- Contact: email form.

## Run locally

Open `index.html` in a browser, or serve this directory:

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

## Notes

The contact form uses `mailto:` and requires a configured email application.

The home-page photograph is credited in [ASSET_CREDITS.md](ASSET_CREDITS.md).

