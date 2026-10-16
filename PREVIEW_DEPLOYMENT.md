# Cloudflare Pages preview deployment

## Prepared preview

Run `npm ci`, `npm test`, and `npm run build:preview` in this checkout. Node 22.12+ or 24+ is required. The output is `dist-preview/`. Preview mode always uses `/` as its base, omits canonical/production sharing URLs and the sitemap, and supplies noindex metadata, an X-Robots-Tag response header and disallow-all robots rules. It deliberately ignores SITE_URL even when a production value is set. It never changes the production configuration in `.env.production`.

`npm run preview:pages` serves this build locally on port 4175. Before uploading, check photos, all seasonal templates, STL/3MF exports, cancellation, reset and mobile layout. Local Vite preview does not apply Cloudflare `_headers`; test those separately or with the Pages runtime.

## Upload without replacing the live site

No Cloudflare account credentials are configured in the current development environment. A preview build is ready, but no Pages project or deployment has been created.

If using an existing Pages project, confirm its project name, account and production branch before deployment. Use a **non-production branch** such as `preview/lithophane`; never assume a project's production branch is `main`. A Direct Upload project's first deployment and dashboard drag-and-drop workflow can create a production deployment, so do not treat any upload as inherently preview-only.

For an authenticated Wrangler setup, after checking the target project's production branch, the preview deployment command is:

```sh
npx wrangler pages deploy dist-preview --project-name YOUR_VERIFIED_PROJECT --branch preview/lithophane
```

This creates an online branch preview. It must not target the project's production branch. Do not attach imgdrop.app or edit its DNS, routes or existing deployment. Preview URLs are publicly reachable unless protected. Configure Cloudflare Access for the preview hostname before sharing if restricted access is required. Noindex is an indexing preference, not access control.

Alternatively, connect the GitHub repository to Pages with a separate production branch and preview branch build configuration. Use `npm run build:preview` and `dist-preview` for preview builds only. The live `/lithophane/` build remains `npm run build` / `dist` and still needs integration into the existing imgdrop.app site.

## Remaining account work

- Identify the Cloudflare account and Pages project; verify its production branch.
- Authenticate through the account's supported secure flow; never put tokens in chat or repository files.
- Choose whether the preview needs Access protection.
- Upload as a non-production branch preview, then validate the actual hosted site, headers and downloads.

## Launch remains separate

No public production release, domain attachment, DNS edits, root robots replacement or Cloudflare account changes are authorized by preparing this preview. Frame compatibility and real print quality still await prototype testing.

## Current validation evidence

Production and preview builds pass, along with seven automated geometry/SEO tests. `npm run check:preview` verifies noindex, root asset paths, absent sitemap/canonical and the JSON-LD CSP hash. The root-hosted preview passed Chromium checks for all four detailed seasonal designs, STL downloads, reset and mobile layout. The ready-to-upload archive is `artifacts/lithophane-pages-preview.zip` (generated output, excluded from Git). No hosted Cloudflare checks have run because no account/project access is configured.

Source is available on GitHub: https://github.com/peggleg/lithophane-site/tree/preview/lithophane . The repository initially had no commits; the preview branch is now its only populated branch. Verify/set a separate production branch in Pages before enabling automatic deployments; do not let the initial Git connection implicitly publish the preview as production.
