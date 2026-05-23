# GAKoBoard

GAKoBoard is a small tabletop helper display for game states that are easier
to manage when the whole table can see them. This first-pass proof of concept
focuses on one **Archenemy Schemes** panel and on proving that local editing,
production builds, and public deployment all work.

The app now ships a trimmed print catalog derived from an exported Scryfall
scheme search. It includes set, release date, scheme type, text, artist, and
reprint metadata, but deliberately does not yet include image or remote URL
fields.

## Local Development

Requirements:

- Node.js 22 or later
- npm

Install dependencies and start the local development server:

```bash
cd /Users/gkr/Dev/gakoboard
npm install
npm run dev
```

Open the local URL shown by Vite. Edit a heading or a style in `src/` to
confirm that the browser updates during development.

Available commands:

```bash
npm run dev        # Start the local editing server
npm run typecheck  # Check TypeScript correctness
npm run lint       # Check source formatting and common errors
npm run build      # Generate the production files in dist/
npm run preview    # Preview the production build locally
```

## Scheme Deck Experience

The landing page is designed as a readable tabletop display, including:

- Set selection controls labeled with set name and release year.
- A separate setting for retaining duplicate printings across selected sets.
- A large current scheme card rendered from the selected print pool.
- An ongoing schemes preview rendered from the included cards.
- A Rules Reminder panel and a touch-friendly Detailed Rules placeholder.
- A dev loop check footer so it is obvious which catalog build is running.

The layout favors high contrast, generous spacing, and large touch targets for
desktop displays and iPads in landscape orientation.

### Shipped Scheme Data

The compact local fixture at `src/data/schemePrints.json` represents printed
cards rather than deduplicated card designs. Selecting multiple sets therefore
models adding multiple product pools: schemes printed in more than one
selected set remain duplicated by default. Turning off **Include duplicate
printings** keeps one printed version per scheme identity.

## Deployment

This repository is configured for a GitHub Pages project site:

- Public URL: <https://gakera.github.io/gakoboard/>
- Vite asset base path: `/gakoboard/`
- Workflow: `.github/workflows/deploy-pages.yml`

Every push to `main`, or a manually triggered workflow run, installs
dependencies, runs typechecking and linting, builds the site, uploads `dist/`
as the Pages artifact, and deploys it through GitHub Pages.

### GitHub Pages Setup

If the workflow reports that Pages is not enabled for the repository:

1. Open the `gakera/gakoboard` repository on GitHub.
2. Select **Settings**.
3. Select **Pages** in the left navigation under **Code and automation**.
4. Under **Build and deployment**, change **Source** to **GitHub Actions**.
5. Open the **Actions** tab and rerun **Deploy to GitHub Pages**, or push a
   new commit to `main`.

Once deployment completes, open
<https://gakera.github.io/gakoboard/> on an iPad browser to verify the table
layout.

## First-Pass Success Criteria

- The project exists at `/Users/gkr/Dev/gakoboard`.
- The app runs locally and updates as text or styles are edited.
- Typechecking, linting, and production build complete successfully.
- The production build can be previewed locally.
- The Git repository can be pushed to the public `gakera/gakoboard` repo.
- GitHub Pages serves the placeholder app publicly.
- The hosted screen is comfortable to use from an iPad browser.

## Later Pass TODO

- Add art image metadata and images through a manually run import script.
- Record the provenance/update process for refreshing the local catalog.
- Expand Detailed Rules once real content is available.

## Verification Commands

```bash
cd /Users/gkr/Dev/gakoboard
git status
git remote -v
npm install
npm run build
npm run preview
gh repo view --web
```
