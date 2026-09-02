# Portfolio — Shyam Zere

Personal portfolio site. Plain HTML/CSS/JS, no build step, no framework —
edit the files directly and push.

## Structure
- `index.html` — content and page structure
- `style.css` — all styling and design tokens (colors/fonts as CSS variables at the top)
- `script.js` — scroll reveal animations, active nav tracking, cursor glow
- `assets/` — resume PDF and any images

## Local preview
Just open `index.html` in a browser. No install, no server needed.

## Deploying (GitHub Pages, free)
1. Push this folder to a GitHub repo named `portfolio` (or anything you like).
2. In the repo, go to Settings > Pages.
3. Under "Build and deployment", set Source to "Deploy from a branch", branch `main`, folder `/ (root)`.
4. Save. The site goes live at `https://<username>.github.io/portfolio/` within a minute or two.
5. Every time you push a change to `main`, the live site updates automatically. No redeploy step.

## Updating content later
Everything is plain text in `index.html`. To add a new project, copy one
`<article class="entry">...</article>` block in the Selected work section and edit it.
