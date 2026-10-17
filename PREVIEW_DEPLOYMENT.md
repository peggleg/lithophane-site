# Cloudflare Pages preview deployment

## Active workflow

GitHub repository: https://github.com/peggleg/lithophane-site . Branch: `preview/lithophane`. Cloudflare Pages project: `lithophane-site`. The existing Git integration builds pushes to that branch; production auto-deployments are disabled in the owner's setup. Do not use a Cloudflare API token or the legacy `pages:create` / `pages:deploy:preview` scripts for this workflow.

Branch preview: https://preview-lithophane.lithophane-site.pages.dev . Confirm the new commit's Cloudflare Pages GitHub check before assuming this URL serves the latest revision. GitHub check output includes the immutable deployment URL and the branch alias. The previous checkpoint `36ddd17` has a successful Pages deployment; a new push must be checked independently.

## Validate and push

```sh
npm ci
npm test
npm run check:resolution
npm run build
npm run build:preview
npm run check:preview
git push origin preview/lithophane
```

The Pages preview build uses `npm run build:preview` and `dist-preview`. Node 22.12+ or 24+ is required. Preview mode forces root asset paths, noindex metadata and headers, disallow-all robots, no canonical production URL and no sitemap, even if SITE_URL is set. Production remains `npm run build` / `dist`, with the `/lithophane/` asset base.

`npm run preview:pages` serves the preview locally on port 4175. Vite preview does not apply Cloudflare response headers, so verify the deployed headers separately. After a successful GitHub check, verify the hosted page, assets, worker export, robots and X-Robots-Tag. See [QUALITY_VALIDATION.md](QUALITY_VALIDATION.md) for the resolution regression procedure and results.

## Release boundaries

This change authorizes a branch preview only. Do not change the production branch, production auto-deployments, imgdrop.app DNS, routes, domain attachment or root robots policy. Public previews remain reachable unless separately protected by Cloudflare Access; noindex is not access control. Subpath production integration and physical frame/print validation remain separate work.

The old Direct Upload project proposal and credential setup notes are obsolete. GitHub's read-only check API is sufficient to inspect deployment results; no Cloudflare token is needed.
