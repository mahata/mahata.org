## Getting Started

The site is plain HTML and CSS in [`public/`](public), with no build step. Edit
`public/index.html` and `public/style.css` directly.

Link icons are SVG `<symbol>`s at the top of `public/index.html`, referenced with
`<use href="#icon-...">`. To add a link, copy an existing `<a class="btn">` block. When adding an
icon, keep the license comment of the icon set it comes from.

To preview locally, run:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Opening
`public/index.html` directly in a browser also works.

## Deploy on GitHub Pages

Biome checks are automated for every pull request and push to `main` by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). After the check passes on a push to
`main`, the workflow publishes `public/` to GitHub Pages, which serves
[mahata.org](https://mahata.org). That workflow is the source of truth for what is live.

The repository's Pages settings use **GitHub Actions** as the source and `mahata.org` as the custom
domain, with HTTPS enforced. Change the domain in **Settings → Pages**, not with a `CNAME` file:
GitHub Pages ignores that file for sites deployed by a custom workflow.

In Cloudflare DNS, `mahata.org` is a CNAME to `mahata.github.io`. Keep its proxy status
**DNS only**, because GitHub Pages can issue the HTTPS certificate only when the domain resolves
directly to GitHub.

To redeploy without a new commit, run the workflow manually:

```bash
gh workflow run deploy.yml --ref main
```
