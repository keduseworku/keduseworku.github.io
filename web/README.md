# Keduse Worku's website

The public site builds from this directory with Vite and React. The homepage
contains the approved Three.js scroll experience. /research/ is a separate
reading page; /cv/ links to the existing resume PDF.

Run npm ci, then npm run build. Use npm run preview to inspect the complete
production build, including prerendered HTML and legacy redirects. No server
runtime is needed on GitHub Pages.

The build prerenders both pages, then hydrates them in the browser. It preserves
existing /assets/ URLs and maps old project URLs to the corresponding research
sections. The old Jekyll source remains in the parent directory for reference
but is no longer the publishing input.

Edit biography in app/page.tsx, research in app/research.tsx and
app/research-figures.tsx, and presentation in app/globals.css.
Image provenance is recorded in RESEARCH-ASSETS.md.

Pushing master runs .github/workflows/deploy.yml and publishes web/dist to the
existing gh-pages branch. Tag before-unseen-release-2026-09-15 preserves the
source immediately before migration.
