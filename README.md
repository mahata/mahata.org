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

[Microsoft Clarity](https://clarity.microsoft.com/) records how visitors use the site. The
[dashboard](https://clarity.microsoft.com/projects/view/z7bcthqq88/dashboard) shows heatmaps and
session recordings.

Every page in `public/` sets up Clarity in its `<head>`. An inline `<script>` defines a
`window.clarity` function that queues calls, and `<script async>` then loads the Clarity tag
`https://www.clarity.ms/tag/z7bcthqq88`. This does the same as the snippet in the Clarity
dashboard, rewritten so that Biome's lint rules pass. Each page footer also links to
[`public/privacy.html`](public/privacy.html). `pnpm test` checks every HTML file in `public/` for
both, so copy them into any new page.

`privacy.html` is the privacy notice that section 4.4(b) of the
[Clarity Terms of Use](https://clarity.microsoft.com/terms) requires. It must say that Microsoft may
collect personal data from visitors and collects or receives it to provide Microsoft Advertising,
link to the Microsoft Privacy Statement, and offer opt-out choices. `pnpm test` checks for these
too. When you change the page, update the date at its top.

The site sends Clarity no consent signal, so Clarity tracks visitors from the EEA, the UK, and
Switzerland without cookies, one page view at a time. For everyone else, **Settings → Setup →
Cookies** in the Clarity project decides whether Clarity sets cookies.

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
