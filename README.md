# GAKoBoard

GAKoBoard is a small tabletop helper display for game states that are easier
to manage when the whole table can see them. The current proof of concept
implements a playable **Archenemy Schemes** loop backed by a local print
catalog.

The app now ships a trimmed print catalog derived from an exported Scryfall
scheme search. It includes set, release date, scheme type, text, artist, and
reprint metadata, but deliberately does not yet include image or remote URL
fields.

Mana symbols needed by scheme rules text are shipped locally under
`src/assets/mana/`; current color and colorless symbol assets render inline in
oracle text, while numeric and variable costs use local styled fallbacks.

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

In VS Code, open **Run and Debug**, choose **Run GAKoBoard (Vite + Browser)**,
and press the play button or `F5`. The checked-in launch configuration starts
the Vite development server and opens the app in VS Code's integrated browser
once the server is ready. Stop the debug session to stop that Vite server.

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
- Regular Archenemy validation for a minimum 20-card deck and no more than two
  copies of any scheme name.
- A shuffled game start flow using the selected printed card pool.
- An explicit **Set Scheme in Motion** action followed by **Resolve & Bottom**
  or **Keep Ongoing** as appropriate.
- Persistent ongoing schemes with an **Abandon & Bottom** action.
- Undo support and a recent game log.
- Browser-local restoration of the selected setup and active game after reload.
- A Rules Reminder panel and a touch-friendly Detailed Rules placeholder.
- A dev loop check footer so it is obvious whether setup or active play is
  being saved.

The layout favors high contrast, generous spacing, and large touch targets for
desktop displays and iPads in landscape orientation.

### Shipped Scheme Data

The compact local fixture at `src/data/schemePrints.json` represents printed
cards rather than deduplicated card designs. Selecting multiple sets therefore
models adding multiple product pools: schemes printed in more than one
selected set remain duplicated by default. Turning off **Include duplicate
printings** keeps one printed version per scheme identity.

### Current Local Persistence

The current set-selection preferences and active shuffled game are stored in
the browser's `localStorage`. Game state includes the ordered face-down deck,
the current scheme awaiting player handling, face-up ongoing schemes, recent
history, and up to 20 undo snapshots.

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

- Add named saved deck configurations, per-card quantity editing, and
  deck-config import/export.
- Add manual tabletop correction tools beyond undo.
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
