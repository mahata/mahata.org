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

Before pushing, run `pnpm run lint` and `pnpm test`.

## Analytics

[Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/) counts visits and page
views and measures Core Web Vitals. See the `mahata.org` site on the
[Web Analytics page](https://dash.cloudflare.com/?to=/:account/web-analytics) of the Cloudflare
dashboard.

Cloudflare injects its beacon automatically only into traffic it proxies, and `mahata.org` is DNS
only (see [Deploy on GitHub Pages](#deploy-on-github-pages)). Every page in `public/` therefore ends
its `<body>` with the JS snippet from **Manage site** in the Cloudflare dashboard. The snippet loads
`https://static.cloudflareinsights.com/beacon.min.js` as a module and passes the site token in
`data-cf-beacon`. `pnpm test` checks every HTML file in `public/` for it, so copy it into any new
page.

The beacon keeps no client-side state such as cookies or `localStorage`, and Cloudflare states that
Web Analytics does not collect or use visitors' personal data
([About](https://developers.cloudflare.com/web-analytics/about/),
[Core Web Vitals](https://developers.cloudflare.com/web-analytics/data-metrics/core-web-vitals/#information-collected)),
so the site has no privacy page.

## Deploy on GitHub Pages

Biome checks and tests run on every pull request and push to `main` in
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). After they pass on a push to
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
